package com.example.demo.dto;

import java.math.BigDecimal;

public class OrderItemDTO {
    private String productName; // hoặc foodName
    private int quantity;
    private BigDecimal price;
    private String image;

    public OrderItemDTO(String productName, int quantity, BigDecimal price) {
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
    }
    public OrderItemDTO(String productName, int quantity, BigDecimal price, String image) {
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
        this.image = image;
    }

    // Getters
    public String getProductName() { return productName; }
    public int getQuantity() { return quantity; }
    public BigDecimal getPrice() { return price; }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
