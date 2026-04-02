package com.example.demo.service;

import com.example.demo.model.ConfigMomo;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class MomoService {

    public String createPayment(String orderId, Long amount) {
        try {

            String requestId = ConfigMomo.PARTNER_CODE + new Date().getTime();
            String orderInfo = "Thanh toan don hang " + orderId;
            String extraData = "";

            String rawSignature =
                    "accessKey=" + ConfigMomo.ACCESS_KEY +
                            "&amount=" + amount +
                            "&extraData=" + extraData +
                            "&ipnUrl=" + ConfigMomo.IPN_URL +
                            "&orderId=" + orderId +
                            "&orderInfo=" + orderInfo +
                            "&partnerCode=" + ConfigMomo.PARTNER_CODE +
                            "&redirectUrl=" + ConfigMomo.REDIRECT_URL +
                            "&requestId=" + requestId +
                            "&requestType=" + ConfigMomo.REQUEST_TYPE;

            String signature = signHmacSHA256(rawSignature);

            JSONObject body = new JSONObject();
            body.put("partnerCode", ConfigMomo.PARTNER_CODE);
            body.put("accessKey", ConfigMomo.ACCESS_KEY);
            body.put("requestId", requestId);
            body.put("amount", amount.toString()); // nên để string cho chắc
            body.put("orderId", orderId); // giờ là String
            body.put("orderInfo", orderInfo);
            body.put("redirectUrl", ConfigMomo.REDIRECT_URL);
            body.put("ipnUrl", ConfigMomo.IPN_URL);
            body.put("extraData", extraData);
            body.put("requestType", ConfigMomo.REQUEST_TYPE);
            body.put("signature", signature);
            body.put("lang", "vi");

            CloseableHttpClient client = HttpClients.createDefault();
            HttpPost post = new HttpPost(ConfigMomo.ENDPOINT);
            post.setHeader("Content-Type", "application/json");
            post.setEntity(new StringEntity(body.toString(), StandardCharsets.UTF_8));

            CloseableHttpResponse response = client.execute(post);

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(response.getEntity().getContent())
            );

            StringBuilder result = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                result.append(line);
            }

            return result.toString();

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\":\"" + e.getMessage() + "\"}";
        }
    }

    private String signHmacSHA256(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec =
                new SecretKeySpec(ConfigMomo.SECRET_KEY.getBytes(StandardCharsets.UTF_8),
                        "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder result = new StringBuilder();
        for (byte b : hash) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}