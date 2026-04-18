package com.example.demo.dto;

import lombok.Data;

@Data
public class VnpayRequest {
    private int userId;
    private int orderId;
    private int amount;
    private String orderInfo;
    private String returnUrl;
}