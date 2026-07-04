package com.example.demo.service;

import com.example.demo.model.Users;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<Users> getUser(int id) {
        return userRepository.findById(id);
    }

    public Users save(Users user) {
        return userRepository.save(user);
    }

    public void deleteUser(int id) {
        userRepository.deleteById(id);
    }

    public Optional<Users> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi mã hóa mật khẩu", e);
        }
    }
    public Map<String, Object> validateRegister(Users user) {

        Map<String, Object> result = new HashMap<>();

        // Họ tên
        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
            result.put("valid", false);
            result.put("message", "Họ tên không được để trống");
            return result;
        }

        // Email
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            result.put("valid", false);
            result.put("message", "Email không được để trống");
            return result;
        }

        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";

        if (!user.getEmail().matches(emailRegex)) {
            result.put("valid", false);
            result.put("message", "Email không đúng định dạng");
            return result;
        }

        // Email đã tồn tại
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            result.put("valid", false);
            result.put("message", "Email đã được đăng ký");
            return result;
        }

        // Số điện thoại
        if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            result.put("valid", false);
            result.put("message", "Số điện thoại không được để trống");
            return result;
        }

        String phoneRegex = "^(0|\\+84)[0-9]{9}$";

        if (!user.getPhone().matches(phoneRegex)) {
            result.put("valid", false);
            result.put("message", "Số điện thoại không hợp lệ");
            return result;
        }

        // Password
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            result.put("valid", false);
            result.put("message", "Mật khẩu phải có ít nhất 6 ký tự");
            return result;
        }

        result.put("valid", true);

        return result;
    }

}
