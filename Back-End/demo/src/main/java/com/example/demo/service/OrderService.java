package com.example.demo.service;

import com.example.demo.dto.OrderDTO;
import com.example.demo.dto.OrderItemDTO;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private FoodRepository foodRepository;


    @Transactional
    public Order createOrder(Order order, String paymentMethod) {

        order.setDate(LocalDateTime.now());

        order.setStatus("Đang xử lý");

        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                detail.setOrder(order);

                if (detail.getFood() != null && detail.getFood().getId() != 0) {
                    foodRepository.findById(detail.getFood().getId())
                            .ifPresent(detail::setFood);
                }
            }
        }

        // ================== PAYMENT ==================
        if (order.getPayment() != null) {

            Payment p = order.getPayment();
            p.setOrder(order);
            p.setDate(LocalDateTime.now());

            if ("COD".equalsIgnoreCase(paymentMethod)) {
                p.setMethod("Thanh toán khi nhận hàng");
            } else if ("VNPAY".equalsIgnoreCase(paymentMethod)) {
                p.setMethod("Thanh toán qua VNPAY");
            } else if ("MOMO".equalsIgnoreCase(paymentMethod)) {
                p.setMethod("Thanh toán qua MOMO");
            }

            p.setStatus("Chờ thanh toán");
        }

        return orderRepo.save(order);
    }
    public void deleteOrder(int orderId) {
        orderRepo.deleteById(orderId);
    }
    public List<OrderDTO> getOrdersByUserId(int userId) {
        List<Order> orders = orderRepo.findByUserIdOrderByDateDesc(userId);

        return orders.stream().map(order -> {
            List<OrderItemDTO> itemDTOs = order.getOrderDetails().stream()
                    .map(detail -> new OrderItemDTO(
                            detail.getFood() != null ? detail.getFood().getName() : "Không rõ tên",
                            detail.getQuantity(),
                            detail.getUnitPrice(),
                            detail.getFood().getImg()
                    ))
                    .collect(Collectors.toList());

            return new OrderDTO(
                    order.getId(),
                    order.getTotalAmount(),
                    order.getPayment() != null ? order.getPayment().getMethod() : "Tiền mặt",
                    order.getNote(),
                    order.getStatus(),
                    order.getDate(),
                    itemDTOs
            );
        }).collect(Collectors.toList());
    }
    @Transactional
    public void updateOrderStatus(int orderId, String status) {
        orderRepo.findById(orderId).ifPresent(order -> {
            order.setStatus(status);
            orderRepo.save(order);
        });
    }
    @Transactional
    public void updateOrderOnline(int orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.getPayment().setStatus("Đã thanh toán");
        order.setDeliveredAt(LocalDateTime.now());
    }


    public Order getOrderById(int orderId) {
        return orderRepo.findById(orderId).orElse(null);
    }
    @Transactional
    public void updatePaymentStatus(String orderIdStr, String status, String transIdFromMomo) {
        try {
            System.out.println("Updating payment status for order: " + orderIdStr);

            int orderId;

            // Parse cả 2 format
            if (orderIdStr.startsWith("MOMO_")) {
                String[] parts = orderIdStr.split("_");
                orderId = Integer.parseInt(parts[1]);
            } else {
                orderId = Integer.parseInt(orderIdStr);
            }

            Order order = orderRepo.findById(orderId).orElse(null);
            if (order != null) {
                // Đảm bảo có payment
                if (order.getPayment() == null) {
                    Payment payment = new Payment();
                    payment.setMethod("Thanh toán qua Momo");
                    payment.setDate(LocalDateTime.now());
                    payment.setOrder(order);
                    order.setPayment(payment);
                }

                Payment payment = order.getPayment();

                if ("SUCCESS".equalsIgnoreCase(status) || "0".equals(status)) {
                    payment.setStatus("Đã thanh toán");
                    payment.setDate(LocalDateTime.now());
                    payment.setMethod("Thanh toán qua Momo");
                    order.setStatus("Đã thanh toán");
                    System.out.println(" Updated to SUCCESS for order: " + orderId);
                } else if ("FAILED".equalsIgnoreCase(status)) {
                    payment.setStatus("Thanh toán thất bại");
                    payment.setDate(LocalDateTime.now());
                    order.setStatus("Thanh toán thất bại");
                    System.out.println(" Updated to FAILED for order: " + orderId);
                }

                orderRepo.save(order);
            } else {
                System.err.println(" Order not found for ID: " + orderId);
            }

        } catch (Exception e) {
            System.err.println(" Error updating payment status: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ✅ SỬA METHOD: Nhận cả 2 format
    public Order getOrderByMomoOrderId(String momoOrderId) {
        try {
            System.out.println("🔍 Getting order by Momo order ID: " + momoOrderId);

            int orderId;

            // Kiểm tra format
            if (momoOrderId.startsWith("MOMO_")) {
                // Format: "MOMO_26_1734943200000"
                String[] parts = momoOrderId.split("_");
                if (parts.length >= 2) {
                    orderId = Integer.parseInt(parts[1]);
                } else {
                    System.err.println("❌ Invalid MOMO format: " + momoOrderId);
                    return null;
                }
            } else {
                // Format: "26" (chỉ số)
                try {
                    orderId = Integer.parseInt(momoOrderId);
                } catch (NumberFormatException e) {
                    System.err.println("❌ Not a number: " + momoOrderId);
                    return null;
                }
            }

            System.out.println("🔍 Parsed orderId: " + orderId);
            return orderRepo.findById(orderId).orElse(null);

        } catch (Exception e) {
            System.err.println("❌ Error parsing momoOrderId: " + e.getMessage());
            return null;
        }
    }

    // ✅ METHOD 3: Lấy payment status từ order
    public String getPaymentStatusByMomoOrderId(String momoOrderId) {
        try {
            String[] parts = momoOrderId.split("_");
            if (parts.length >= 2) {
                int orderId = Integer.parseInt(parts[1]);
                Order order = orderRepo.findById(orderId).orElse(null);
                if (order != null && order.getPayment() != null) {
                    return order.getPayment().getStatus();
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error getting payment status: " + e.getMessage());
        }
        return "Chờ thanh toán"; // Mặc định
    }

    // ✅ METHOD 4: Tạo order với payment method MOMO (tùy chọn)
    @Transactional
    public Order createMomoOrder(Order order) {
        // set thời gian + trạng thái cho order
        order.setDate(LocalDateTime.now());
        order.setStatus("Chờ thanh toán");

        // Xử lý order details
        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                detail.setOrder(order);
                if (detail.getFood() != null && detail.getFood().getId() != 0) {
                    foodRepository.findById(detail.getFood().getId())
                            .ifPresent(detail::setFood);
                }
            }
        }

        // Tạo payment cho Momo
        if (order.getPayment() == null) {
            Payment payment = new Payment();
            payment.setMethod("Thanh toán qua Momo");
            payment.setStatus("Chờ thanh toán");
            payment.setDate(LocalDateTime.now());
            payment.setOrder(order);
            order.setPayment(payment);
        } else {
            order.getPayment().setOrder(order);
        }

        Order saved = orderRepo.save(order);
        System.out.println("✅ Created Momo order with ID: " + saved.getId());
        return saved;
    }

    // Check đơn hàng user
    public boolean isNewUser(int userId) {
        return orderRepo.countByUserId(userId) == 0;
    }

    // Service chi tiết đơn hang
    public OrderDTO getOrderDetailById(int orderId) {
        Optional<Order> orderOpt = orderRepo.findById(orderId);
        if (orderOpt.isEmpty()) return null;

        Order order = orderOpt.get();

        List<OrderItemDTO> itemDTOs = order.getOrderDetails().stream()
                .map(detail -> new OrderItemDTO(
                        detail.getFood() != null ? detail.getFood().getName() : "Không rõ tên",
                        detail.getQuantity(),
                        detail.getUnitPrice(),
                        detail.getFood() != null ? detail.getFood().getImg() : ""
                ))
                .collect(Collectors.toList());

        return new OrderDTO(
                order.getId(),
                order.getTotalAmount(),
                order.getPayment() != null ? order.getPayment().getMethod() : "Tiền mặt",
                order.getNote(),
                order.getStatus(),
                order.getDate(),
                itemDTOs
        );
    }

}
