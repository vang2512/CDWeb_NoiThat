package com.example.demo.dto;

public class TopSentimentProductDTO {

    private Integer productId;
    private String productName;
    private String image;
    private Long reviewCount;

    public TopSentimentProductDTO(Integer productId,
                                  String productName,
                                  String image,
                                  Long reviewCount) {
        this.productId = productId;
        this.productName = productName;
        this.image = image;
        this.reviewCount = reviewCount;
    }

    public Integer getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getImage() {
        return image;
    }

    public Long getReviewCount() {
        return reviewCount;
    }
}