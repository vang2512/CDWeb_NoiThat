package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {
    private final Map<String, String> otpStorage = new HashMap<>();
    private final Map<String, LocalDateTime> expiryStorage = new HashMap<>();

    public String generateOtp(String email) {
        String otp = String.format("%04d", new Random().nextInt(10000));
        otpStorage.put(email, otp);
        expiryStorage.put(email, LocalDateTime.now().plusMinutes(1));
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        if (!otpStorage.containsKey(email)) return false;
        if (LocalDateTime.now().isAfter(expiryStorage.get(email))) return false;
        return otpStorage.get(email).equals(otp);
    }

    public void clearOtp(String email) {
        otpStorage.remove(email);
        expiryStorage.remove(email);
    }
}
