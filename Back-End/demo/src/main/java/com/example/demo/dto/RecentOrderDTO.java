package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RecentOrderDTO {

    private int id;
    private String customerName;
    private BigDecimal totalAmount;
    private String status;
    private String paymentMethod;
    private LocalDateTime orderDate;

    public RecentOrderDTO(
            int id,
            String customerName,
            BigDecimal totalAmount,
            String status,
            String paymentMethod,
            LocalDateTime orderDate
    ) {
        this.id = id;
        this.customerName = customerName;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.orderDate = orderDate;
    }

    public int getId() {
        return id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }
}