package com.example.demo.controller;

import com.example.demo.dto.ShippingFeeRequest;
import com.example.demo.dto.ShippingFeeResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipping")
@CrossOrigin
public class ShippingController {

    private static final double SHOP_LAT = 10.8715;
    private static final double SHOP_LNG = 106.7890;

    @PostMapping(
            value = "/calculate",
            consumes = "application/json",
            produces = "application/json"
    )
    public ShippingFeeResponse calculateShipping(@RequestBody ShippingFeeRequest req) {

        double distanceKm = haversine(
                SHOP_LAT, SHOP_LNG,
                req.getLat(), req.getLng()
        );

        double shippingFee;

        if (distanceKm <= 3) {
            shippingFee = 15000;
        } else if (distanceKm <= 7) {
            shippingFee = 25000;
        } else if (distanceKm <= 15) {
            shippingFee = 40000;
        } else {
            shippingFee = 60000;
        }

        return new ShippingFeeResponse(distanceKm, shippingFee);
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2)
                        + Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
