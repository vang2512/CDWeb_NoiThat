package com.example.demo.dto;

import lombok.Data;

@Data
public class LlmIntent {

    private Boolean orderQuery;
    private Boolean productQuery;

    private String productType;

    private String orderStatus;
    private String date;
    private String reply;

}


