package com.example.demo.model;

public class ConfigMomo {

    // Sandbox endpoint
    public static final String ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
    public static final String QUERY_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/query";

    // Test credentials (sandbox public)
    public static final String PARTNER_CODE = "MOMO";
    public static final String ACCESS_KEY = "F8BBA842ECF85";
    public static final String SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

    // Backend return URL
    public static final String REDIRECT_URL =
            "http://localhost:8080/api/payment/momo-return";

    public static final String IPN_URL =
            "https://callback.url/notify";

    public static final String REQUEST_TYPE = "payWithMethod";
}
