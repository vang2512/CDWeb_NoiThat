package com.example.demo.dto;

import lombok.Data;

@Data
public class CategoryStatisticDTO {

    private String name;
    private Long value;

    public CategoryStatisticDTO(String name, Long value) {
        this.name = name;
        this.value = value;
    }
}