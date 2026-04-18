package com.example.demo.dto;

import lombok.Data;

@Data
public class MomoRequest {
    private String requestId;
    private String orderId;
    private Long amount;
    private String orderInfo;
    private String extraData;
    private Integer userId;
    private String returnUrl;
}