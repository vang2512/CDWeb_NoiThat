package com.example.demo.dto;

import lombok.Data;

@Data
public class TopSellingProductDTO {

    private int id;
    private String name;
    private double price;
    private String img;
    private int sold;
    private double revenue;

    public TopSellingProductDTO(
            int id,
            String name,
            double price,
            String img,
            int sold,
            double revenue
    ) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.img = img;
        this.sold = sold;
        this.revenue = revenue;
    }

}