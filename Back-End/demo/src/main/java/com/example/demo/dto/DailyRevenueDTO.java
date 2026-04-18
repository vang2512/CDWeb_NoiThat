package com.example.demo.dto;

public class DailyRevenueDTO {
    private String date;
    private double revenue;

    public DailyRevenueDTO(String date, double revenue) {
        this.date = date;
        this.revenue = revenue;
    }

    public String getDate() { return date; }
    public double getRevenue() { return revenue; }
}
