package com.example.demo.dto;

import lombok.Data;

@Data
public class VoiceSearchIntent {

    private Boolean searchFood;

    private String foodName;

    private String categoryName;

    private String priceType;

    private Double minPrice;
    private Double maxPrice;

    private Boolean recommend;

    private String reply;
}
