package com.example.demo.service;

import com.example.demo.model.Order;
import com.example.demo.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.config.ConfigVNPay;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
@Service
public class VnpayService {

    @Autowired
    private OrderRepository orderRepository;

    public Map<String, String> createVNPayPayment(
            int orderId,
            long amount,
            String ipAddress
    ) throws Exception {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));
        String txnRef = String.valueOf(orderId);
        Map<String, String> vnpParams = new HashMap<>();

        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", ConfigVNPay.vnp_TmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount * 100));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo",
                "Thanh toan don hang " + orderId);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl",
                ConfigVNPay.vnp_ReturnUrl);
        vnpParams.put("vnp_IpAddr", ipAddress);

        SimpleDateFormat formatter =
                new SimpleDateFormat("yyyyMMddHHmmss");

        vnpParams.put(
                "vnp_CreateDate",
                formatter.format(new Date())
        );

        List<String> fieldNames =
                new ArrayList<>(vnpParams.keySet());

        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (int i = 0; i < fieldNames.size(); i++) {

            String fieldName = fieldNames.get(i);
            String value = vnpParams.get(fieldName);

            if (value != null && !value.isEmpty()) {

                String encodedValue =
                        URLEncoder.encode(
                                value,
                                StandardCharsets.US_ASCII
                        );

                hashData.append(fieldName)
                        .append("=")
                        .append(encodedValue);

                query.append(fieldName)
                        .append("=")
                        .append(encodedValue);

                if (i < fieldNames.size() - 1) {
                    hashData.append("&");
                    query.append("&");
                }
            }
        }

        String secureHash =
                hmacSHA512(
                        ConfigVNPay.secretKey,
                        hashData.toString()
                );

        query.append("&vnp_SecureHash=")
                .append(secureHash);

        String paymentUrl =
                ConfigVNPay.vnp_PayUrl + "?" + query;

        return Map.of(
                "paymentUrl",
                paymentUrl
        );
    }

    private String hmacSHA512(String key, String data) throws Exception {

        Mac mac = Mac.getInstance("HmacSHA512");

        SecretKeySpec secretKeySpec =
                new SecretKeySpec(
                        key.getBytes(StandardCharsets.UTF_8),
                        "HmacSHA512"
                );

        mac.init(secretKeySpec);

        byte[] hashBytes =
                mac.doFinal(
                        data.getBytes(StandardCharsets.UTF_8)
                );
        StringBuilder hash = new StringBuilder();
        for (byte b : hashBytes) {
            hash.append(
                    String.format("%02x", b)
            );
        }
        return hash.toString();
    }
}
