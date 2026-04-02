package com.example.demo.controller;


import com.example.demo.dto.OrderDTO;
import com.example.demo.entity.*;
import com.example.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            int userId = (int) payload.get("userId");
            String note = (String) payload.get("note");
            String paymentMethod = (String) payload.get("paymentMethod");
            double totalAmount = ((Number) payload.get("totalAmount")).doubleValue();

            List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");

            Order order = new Order();
            order.setUserId(userId);
            order.setNote(note);
            order.setTotalAmount(BigDecimal.valueOf(totalAmount));
            order.setDate(LocalDateTime.now());
            order.setStatus("PENDING");

            List<OrderDetail> details = new ArrayList<>();
            for (Map<String, Object> item : items) {
                OrderDetail detail = new OrderDetail();

                Product food = new Product();
                food.setId((int) item.get("foodId"));
                detail.setFood(food);

                detail.setQuantity((int) item.get("quantity"));
                detail.setUnitPrice(BigDecimal.valueOf(((Number) item.get("price")).doubleValue()));
                detail.setOrder(order);
                details.add(detail);
            }
            order.setOrderDetails(details);

            Payment payment = new Payment();
            payment.setMethod(paymentMethod);
            payment.setStatus("PENDING");
            payment.setDate(LocalDateTime.now());
            payment.setOrder(order);

            order.setPayment(payment);
            Order savedOrder = orderService.createOrder(order, paymentMethod);

            return ResponseEntity.ok(Map.of(
                    "orderId", savedOrder.getId(),
                    "message", "Đặt hàng thành công!"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<OrderDTO>> getOrderHistory(@PathVariable int userId) {
        List<OrderDTO> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    // Hủy đơn hàng (user)
    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable int orderId, @RequestParam int userId) {
        try {
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

            return ResponseEntity.ok(Map.of(
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
        return "Updated successfully";
    }

    @DeleteMapping("/delete/{orderId}")
    public ResponseEntity<?> deleteOrder(
            @PathVariable int orderId,
            @RequestParam int userId) {

        try {

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
            if (!order.getPayment().getStatus().equalsIgnoreCase("Chờ thanh toán")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Chỉ được xóa đơn chưa thanh toán"));
            }

            orderService.deleteOrder(orderId);

            return ResponseEntity.ok(Map.of(
                    "message", "Xóa đơn hàng thành công",
                    "orderId", orderId
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
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
