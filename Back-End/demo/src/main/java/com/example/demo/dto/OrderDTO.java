package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {
    private int id;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String note;
    private String status;
    private LocalDateTime date;
    private List<OrderItemDTO> items;
    private int userId;
    private LocalDateTime deliveredAt;

    public OrderDTO(int id, BigDecimal totalAmount, String paymentMethod, String note,
                    String status, LocalDateTime date, List<OrderItemDTO> items) {
        this.id = id;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.note = note;
        this.status = status;
        this.date = date;
        this.items = items;
    }
    public OrderDTO(int id, BigDecimal totalAmount, String paymentMethod, String note,
                    String status, LocalDateTime date, List<OrderItemDTO> items, int userId) {
        this.id = id;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.note = note;
        this.status = status;
        this.date = date;
        this.items = items;
        this.userId = userId;
    }
    public OrderDTO(
            int id,
            BigDecimal totalAmount,
            String paymentMethod,
            String note,
            String status,
            LocalDateTime date,
            LocalDateTime deliveredAt,
            List<OrderItemDTO> items,
            int userId
    ) {
        this.id = id;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.note = note;
        this.status = status;
        this.date = date;
        this.deliveredAt = deliveredAt;
        this.items = items;
        this.userId = userId;
    }

    // Getters
    public int getId() { return id; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getNote() { return note; }
    public String getStatus() { return status; }
    public LocalDateTime getDate() { return date; }
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public List<OrderItemDTO> getItems() { return items; }
    public int getUserId() { return userId; }
}
