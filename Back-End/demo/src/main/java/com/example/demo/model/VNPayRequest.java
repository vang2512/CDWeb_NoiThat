package com.example.demo.model;

public class VNPayRequest {
    private int userId;
    private int orderId;
    private long amount; // dùng long cho số tiền lớn
    private String orderInfo;
    private String returnUrl;

    // constructor, getter & setter
    public VNPayRequest() {}

    public VNPayRequest(int userId, int orderId, long amount, String orderInfo, String returnUrl) {
        this.userId = userId;
        this.orderId = orderId;
        this.amount = amount;
        this.orderInfo = orderInfo;
        this.returnUrl = returnUrl;
    }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getOrderId() { return orderId; }
    public void setOrderId(int orderId) { this.orderId = orderId; }

    public long getAmount() { return amount; }
    public void setAmount(long amount) { this.amount = amount; }

    public String getOrderInfo() { return orderInfo; }
    public void setOrderInfo(String orderInfo) { this.orderInfo = orderInfo; }

    public String getReturnUrl() { return returnUrl; }
    public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }
}
