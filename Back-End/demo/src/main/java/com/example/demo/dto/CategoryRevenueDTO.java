package com.example.demo.dto;

public class CategoryRevenueDTO {

    private String name;
    private Double revenue;

    public CategoryRevenueDTO(String name, Double revenue) {
        this.name = name;
        this.revenue = revenue;
    }

    public String getName() {
        return name;
    }

    public Double getRevenue() {
        return revenue;
    }
}