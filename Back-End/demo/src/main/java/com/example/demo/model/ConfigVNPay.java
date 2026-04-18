package com.example.demo.model;

import jakarta.servlet.http.HttpServletRequest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class ConfigVNPay {

    // ==================== CONFIGURATION ====================
    public static String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static String vnp_ReturnUrl = "http://localhost:8080/api/payment/vnpay-return";
    public static String vnp_TmnCode = "JGV9MSIF";
    public static String secretKey = "E9QLQ1W7KCLQKQLE5522R5JNRR7WIV8I";

}