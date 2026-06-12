package com.example.demo.controller;


import com.example.demo.dto.OrderDTO;
import com.example.demo.entity.*;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.LogService;
import com.example.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import com.example.demo.model.IpUtils;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;
    @Autowired
    private LogService logService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(
            @RequestBody Map<String, Object> payload,
            Authentication authentication
    ) {
        try {
            // Lấy user từ JWT
            String email = authentication.getName();
            Users user = userRepository
                    .findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));
            int userId = user.getUserId();

            String note = (String) payload.get("note");

            String paymentMethod =
                    (String) payload.get("paymentMethod");

            double totalAmount =
                    ((Number) payload.get("totalAmount")).doubleValue();

            String customerName =
                    (String) payload.get("customerName");

            String phoneNumber =
                    (String) payload.get("phoneNumber");

            String shippingAddress =
                    (String) payload.get("shippingAddress");

            double discountAmount =
                    payload.get("discountAmount") != null
                            ? ((Number) payload.get("discountAmount")).doubleValue()
                            : 0;

            List<Map<String, Object>> items =
                    (List<Map<String, Object>>) payload.get("items");

            Order order = new Order();

            // userId lấy từ JWT
            order.setUserId(userId);

            order.setNote(note);

            order.setTotalAmount(
                    BigDecimal.valueOf(totalAmount)
            );

            order.setDiscountAmount(
                    BigDecimal.valueOf(discountAmount)
            );

            order.setCustomerName(customerName);

            order.setCustomerPhone(phoneNumber);

            order.setShippingAddress(shippingAddress);

            order.setDate(LocalDateTime.now());

            order.setStatus("PENDING");

            List<OrderDetail> details = new ArrayList<>();

            for (Map<String, Object> item : items) {

                OrderDetail detail =
                        new OrderDetail();

                Product food =
                        new Product();

                food.setId(
                        (int) item.get("foodId")
                );

                detail.setFood(food);

                detail.setQuantity(
                        (int) item.get("quantity")
                );

                detail.setUnitPrice(
                        BigDecimal.valueOf(
                                ((Number) item.get("price"))
                                        .doubleValue()
                        )
                );

                detail.setOrder(order);

                details.add(detail);
            }

            order.setOrderDetails(details);

            Payment payment =
                    new Payment();

            payment.setMethod(paymentMethod);

            payment.setStatus("PENDING");

            payment.setDate(LocalDateTime.now());

            payment.setOrder(order);

            order.setPayment(payment);

            Order savedOrder =
                    orderService.createOrder(
                            order,
                            paymentMethod
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "orderId",
                            savedOrder.getId(),

                            "message",
                            "Đặt hàng thành công!"
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }
    @GetMapping("/history")
    public ResponseEntity<List<OrderDTO>> getOrderHistory(
            Authentication authentication
    ) {
        String email = authentication.getName();
        Users currentUser = userRepository
                .findByEmail(email)
                .orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .build();
        }
        List<OrderDTO> orders =
                orderService.getOrdersByUserId(
                        currentUser.getUserId()
                );
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/detail/{orderId}")
    public ResponseEntity<?> getOrderDetail(
            @PathVariable int orderId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Users currentUser = userRepository
                .findByEmail(email)
                .orElse(null);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token không hợp lệ");
        }
        OrderDTO orderDTO =
                orderService.getOrderDetailById(orderId);

        if (orderDTO == null) {
            return ResponseEntity.notFound().build();
        }
        if (orderDTO.getUserId() != currentUser.getUserId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Bạn không có quyền xem đơn hàng này");
        }

        return ResponseEntity.ok(orderDTO);
    }

    // Hủy đơn hàng (user)
    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrder(
            @PathVariable int orderId,
            Authentication authentication
    ) {
        try {

            // lấy email từ JWT
            String email = authentication.getName();

            Users currentUser = userRepository
                    .findByEmail(email)
                    .orElse(null);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Token không hợp lệ"));
            }

            int userId = currentUser.getUserId();

            Order order = orderService.getOrderById(orderId);

            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Đơn hàng không tồn tại"));
            }

            if (order.getUserId() != userId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Bạn không có quyền hủy đơn này"));
            }

            if (!"Đang xử lý".equalsIgnoreCase(order.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Chỉ có thể hủy đơn đang xử lý"));
            }

            orderService.updateOrderStatus(orderId, "Đã huỷ");

            logService.saveActivityLog(
                    "CANCEL_ORDER",
                    "ORDER",
                    currentUser,
                    "Hủy đơn hàng #" + orderId,
                    "unknown"
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Hủy đơn hàng thành công",
                    "orderId", orderId
            ));

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/update-online")
    public String updateOnline(@RequestParam int orderId) {
        orderService.updateOrderOnline(orderId);
        logService.saveActivityLog(
                "ONLINE_PAYMENT",
                "PAYMENT",
                null,
                "Thanh toán online đơn #" + orderId,
                "unknown"
        );
        return "Updated successfully";
    }

    @DeleteMapping("/delete/{orderId}")
    public ResponseEntity<?> deleteOrder(
            @PathVariable int orderId,
            Authentication authentication) {

        try {

            // Lấy user từ JWT
            String email = authentication.getName();

            Users currentUser = userRepository
                    .findByEmail(email)
                    .orElse(null);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Token không hợp lệ"));
            }

            int userId = currentUser.getUserId();

            Order order = orderService.getOrderById(orderId);

            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Đơn hàng không tồn tại"));
            }

            if (order.getUserId() != userId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Bạn không có quyền xóa đơn này"));
            }

            // Chỉ cho xóa khi chưa thanh toán
            if (!order.getPayment().getStatus()
                    .equalsIgnoreCase("Chờ thanh toán")) {

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                                "error",
                                "Chỉ được xóa đơn chưa thanh toán"
                        ));
            }

            orderService.deleteOrder(orderId);

            logService.saveActivityLog(
                    "DELETE_ORDER",
                    "ORDER",
                    currentUser,
                    "Xóa đơn hàng #" + orderId,
                    "unknown"
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Xóa đơn hàng thành công",
                    "orderId", orderId
            ));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));
        }
    }
    @GetMapping("/check-new-user/{userId}")
    public ResponseEntity<Map<String, Object>> checkNewUser(
            @PathVariable int userId) {

        boolean isNewUser = orderService.isNewUser(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("isNewUser", isNewUser);

        return ResponseEntity.ok(response);
    }

}
