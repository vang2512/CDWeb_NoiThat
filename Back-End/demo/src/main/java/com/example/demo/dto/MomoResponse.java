package com.example.demo.dto;

import lombok.Data;

@Data
public class MomoResponse {
    private String partnerCode;
    private String requestId;
    private String orderId;
    private String amount;
    private Long responseTime;
    private String message;
    private Integer resultCode;
    private String payUrl;        // URL thanh toán Momo
    private String deeplink;      // Deeplink mở app Momo
    private String qrCodeUrl;     // URL QR code
    private String signature;
}