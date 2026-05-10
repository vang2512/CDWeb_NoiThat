package com.example.demo.dto;

public class MonthlyRevenueDTO {

    private String month;
    private Double revenue;
    private Long orders;

    public MonthlyRevenueDTO(String month, Double revenue, Long orders) {
        this.month = month;
        this.revenue = revenue;
        this.orders = orders;
    }

    public String getMonth() {
        return month;
    }

    public Double getRevenue() {
        return revenue;
    }

    public Long getOrders() {
        return orders;
    }
}