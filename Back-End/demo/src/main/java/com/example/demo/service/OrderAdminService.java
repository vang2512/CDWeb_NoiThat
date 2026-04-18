package com.example.demo.service;

import com.example.demo.dto.OrderDTO;
import com.example.demo.dto.OrderItemDTO;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderDetail;
import com.example.demo.entity.Payment;
import com.example.demo.repository.OrderRepository;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderAdminService {

    @Autowired
    private OrderRepository orderRepository;

    // Lấy tất cả đơn hàng
    public List<OrderDTO> getAllOrders() {

        List<Order> orders = orderRepository.findAll();

        return orders.stream().map(order -> convertToDTO(order)).collect(Collectors.toList());
    }

    // Lấy chi tiết 1 đơn
    public OrderDTO getOrderDetail(int id) {
        Order order = orderRepository.findById(id).orElse(null);
        return convertToDTO(order);
    }

    private OrderDTO convertToDTO(Order order) {
        if (order == null) return null;

        List<OrderItemDTO> items = order.getOrderDetails().stream()
                .map(d -> new OrderItemDTO(
                        d.getFood().getName(),
                        d.getQuantity(),
                        d.getUnitPrice()
                ))
                .collect(Collectors.toList());

        return new OrderDTO(
                order.getId(),
                order.getTotalAmount(),
                order.getPayment() != null
                        ? order.getPayment().getMethod()
                        : "Chưa thanh toán",
                order.getNote(),
                order.getStatus(),
                order.getDate(),
                order.getDeliveredAt(),

                items,
                order.getUserId()
        );
    }

    @Transactional
    public void updateOrderStatus(int orderId, String status) {

        if ("Xác nhận".equals(status)) {
            status = "Đang giao";
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setStatus(status);

        if ("Đã giao".equals(status)) {
            order.setDeliveredAt(LocalDateTime.now());

            Payment payment = order.getPayment();
            if (payment != null) {
                payment.setStatus("Đã thanh toán");
                payment.setDate(LocalDateTime.now());
            }
        }
        orderRepository.save(order);
    }

    public List<OrderDTO> getDeliveredOrders() {
        List<Order> orders = orderRepository.findByStatus("Đã giao");
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
