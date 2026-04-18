package com.example.demo.dto;

public class ShippingFeeResponse {

    private double distanceKm;
    private double shippingFee;

    public ShippingFeeResponse(double distanceKm, double shippingFee) {
        this.distanceKm = distanceKm;
        this.shippingFee = shippingFee;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public double getShippingFee() {
        return shippingFee;
    }
}
