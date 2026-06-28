package com.example.demo.config;

import jakarta.servlet.http.HttpServletRequest;

public class IpUtils {

    public static String getClientIp(HttpServletRequest request) {

        String xForwardedFor = request.getHeader("X-Forwarded-For");

        if (xForwardedFor != null &&
                !xForwardedFor.isEmpty() &&
                !"unknown".equalsIgnoreCase(xForwardedFor)) {

            return xForwardedFor.split(",")[0].trim();
        }

        String ip = request.getRemoteAddr();

        // Convert IPv6 localhost -> IPv4 localhost
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            return "127.0.0.1";
        }

        return ip;
    }
}