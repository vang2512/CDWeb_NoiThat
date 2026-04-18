package com.example.demo.controller;

import com.example.demo.model.ConfigVNPay;
import com.example.demo.entity.Order;
import com.example.demo.entity.Payment;
import com.example.demo.repository.OrderRepository;
import com.example.demo.service.MomoService;
import jakarta.servlet.http.HttpServletRequest;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private MomoService momoService;
    // =========================================================
    // 1️TẠO LINK THANH TOÁN VNPAY
    // =========================================================
    @PostMapping("/create-vnpay")
    public Map<String, String> createPayment(
            @RequestParam int orderId,
            @RequestParam long amount,
            HttpServletRequest request
    ) throws Exception {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String txnRef = String.valueOf(orderId);
        String ipAddress = request.getRemoteAddr();

        Map<String, String> vnpParams = new HashMap<>();

        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", ConfigVNPay.vnp_TmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount * 100));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", ConfigVNPay.vnp_ReturnUrl);
        vnpParams.put("vnp_IpAddr", ipAddress);

        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnpParams.put("vnp_CreateDate", formatter.format(new Date()));

        // Sắp xếp field
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String value = vnpParams.get(fieldName);

            if (value != null && !value.isEmpty()) {

                String encodedValue = URLEncoder.encode(value, StandardCharsets.US_ASCII);

                hashData.append(fieldName).append("=").append(encodedValue);
                query.append(fieldName).append("=").append(encodedValue);

                if (i < fieldNames.size() - 1) {
                    hashData.append("&");
                    query.append("&");
                }
            }
        }

        String secureHash = hmacSHA512(ConfigVNPay.secretKey, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        String paymentUrl = ConfigVNPay.vnp_PayUrl + "?" + query;

        return Map.of("paymentUrl", paymentUrl);
    }

    // =========================================================
    // 2 XỬ LÝ RETURN TỪ VNPAY
    // =========================================================
    @GetMapping("/vnpay-return")
    public RedirectView vnpayReturn(HttpServletRequest request) throws Exception {
        Map<String, String[]> fields = request.getParameterMap();
        Map<String, String> vnpParams = new HashMap<>();

        for (Map.Entry<String, String[]> entry : fields.entrySet()) {
            if (entry.getValue().length > 0) {
                vnpParams.put(entry.getKey(), entry.getValue()[0]);
            }
        }

        String receivedHash = vnpParams.remove("vnp_SecureHash");

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String value = vnpParams.get(fieldName);
            if (value != null && !value.isEmpty()) {
                hashData.append(fieldName).append("=")
                        .append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
                if (i < fieldNames.size() - 1) hashData.append("&");
            }
        }

        String calculatedHash = hmacSHA512(ConfigVNPay.secretKey, hashData.toString());
        if (!calculatedHash.equals(receivedHash)) {
            throw new RuntimeException("Invalid checksum");
        }

        String responseCode = vnpParams.get("vnp_ResponseCode");
        String orderId = vnpParams.get("vnp_TxnRef");

        Order order = orderRepository.findById(Integer.parseInt(orderId))
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("00".equals(responseCode)) {
            if (order.getPayment() != null) order.getPayment().setStatus("Đã thanh toán");
            order.setDeliveredAt(LocalDateTime.now());
        } else {
            order.setStatus("Thanh toán thất bại");
            if (order.getPayment() != null) order.getPayment().setStatus("Thất bại");
        }

        orderRepository.save(order);

        // Chuyển hướng sang frontend React
        String frontendUrl = "http://localhost:3000/order-success?orderId=" + orderId + "&method=VNPAY&status=" + responseCode;
        return new RedirectView(frontendUrl);
    }

    // =========================================================
    // HMAC SHA512
    // =========================================================
    private String hmacSHA512(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKeySpec =
                new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        mac.init(secretKeySpec);
        byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder hash = new StringBuilder();
        for (byte b : hashBytes) {
            hash.append(String.format("%02x", b));
        }
        return hash.toString();
    }
    // MOMO
    @PostMapping("/create-momo")
    public Map<String, String> createMomoPayment(
            @RequestParam Long orderId,
            @RequestParam Long amount
    ) {

        Order order = orderRepository.findById(orderId.intValue())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String momoOrderId = orderId + "_" + System.currentTimeMillis();

        String response = momoService.createPayment(momoOrderId, amount);

        JSONObject json = new JSONObject(response);

        if (json.has("payUrl")) {
            return Map.of("paymentUrl", json.getString("payUrl"));
        } else {
            order.setStatus("Thanh toán thất bại");
            orderRepository.save(order);
            return Map.of("error", response);
        }
    }
    // =========================================================
    @GetMapping("/momo-return")
    public RedirectView momoReturn(HttpServletRequest request) {

        String rawOrderId = request.getParameter("orderId");
        String resultCode = request.getParameter("resultCode");

        if (rawOrderId == null) {
            return new RedirectView("http://localhost:3000/order-failed?reason=missingOrderId");
        }
        String originalOrderId = rawOrderId.split("_")[0];

        Order order = orderRepository.findById(Integer.parseInt(originalOrderId))
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("0".equals(resultCode)) {
            if (order.getPayment() != null) order.getPayment().setStatus("Đã thanh toán");
            order.setDeliveredAt(LocalDateTime.now());
        } else {
            order.setStatus("Thanh toán thất bại");
            if (order.getPayment() != null) order.getPayment().setStatus("Thất bại");
        }

        orderRepository.save(order);

        // Chuyển hướng thẳng sang frontend OrderSuccess
        String frontendUrl = "http://localhost:3000/order-success?orderId=" + originalOrderId + "&method=MOMO&status=" + resultCode;
        return new RedirectView(frontendUrl);
    }
    // =========================================================
// IPN MOMO (Server to Server)
// =========================================================
    @PostMapping("/momo-ipn")
    public Map<String, String> momoIpn(@RequestBody Map<String, Object> body) {

        String rawOrderId = body.get("orderId").toString();
        Integer resultCode = Integer.parseInt(body.get("resultCode").toString());

        String originalOrderId = rawOrderId.split("_")[0];

        Order order = orderRepository.findById(Integer.parseInt(originalOrderId))
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (resultCode == 0) {

            if (order.getPayment() != null) {
                order.getPayment().setStatus("Đã thanh toán");
            }

            order.setDeliveredAt(LocalDateTime.now());

        } else {
            order.setStatus("Thanh toán thất bại");

            if (order.getPayment() != null) {
                order.getPayment().setStatus("Thất bại");
            }
        }

        orderRepository.save(order);

        return Map.of("message", "OK");
    }
}