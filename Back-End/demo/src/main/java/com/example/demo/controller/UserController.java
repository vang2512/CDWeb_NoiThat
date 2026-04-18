package com.example.demo.controller;

import com.example.demo.dto.ResetPasswordRequest;
import com.example.demo.entity.Users;
import com.example.demo.service.EmailService;
import com.example.demo.service.EmailService_Res;
import com.example.demo.service.UserService;
import com.example.demo.repository.UserRepository;
import com.example.demo.dto.SocialLoginRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.service.OtpService;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailService_Res emailServiceRes;

    @Autowired
    private OtpService otpService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/send-otp")
    public Map<String, Object> sendOtp(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra email tồn tại
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            response.put("success", false);
            response.put("message", "Email đã tồn tại!");
            return response;
        }

        // Sinh OTP 4 số và gửi mail thật
        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);

        response.put("success", true);
        response.put("message", "Đã gửi OTP đến email " + email);
        return response;
    }
    @PostMapping("/send-otp-res")
    public Map<String, Object> sendOtp_res(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();

        // Sinh OTP 4 số và gửi mail thật
        String otp = otpService.generateOtp(email);
        emailServiceRes.sendOtpEmail(email, otp);

        response.put("success", true);
        response.put("message", "Đã gửi OTP đến email " + email);
        return response;
    }


    @PostMapping("/verify-otp")
    public Map<String, Object> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        boolean isValid = otpService.verifyOtp(email, otp);

        if (isValid) {
            otpService.clearOtp(email);
            return Map.of("valid", true, "message", "OTP hợp lệ");
        } else {
            return Map.of("valid", false, "message", "OTP không đúng hoặc đã hết hạn");
        }
    }
    @PostMapping("/social-login")
    public Map<String, Object> socialLogin(@RequestBody SocialLoginRequest body) {

        Map<String, Object> response = new HashMap<>();

        String email = body.getEmail();
        String fullName = body.getFullName();

        Optional<Users> userOpt = userRepository.findByEmail(email);

        Users user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
            if (user.getRole() != 1) {
                response.put("success", false);
                response.put("message", "Email này thuộc tài khoản Admin, không thể đăng nhập bằng Google");
                return response;
            }
            if (Boolean.TRUE.equals(user.getIsDeleted())) {
                response.put("success", false);
                response.put("message", "Tài khoản đã bị khóa");
                return response;
            }

        } else {
            user = new Users();
            user.setEmail(email);
            user.setFullName(fullName);
            user.setRole(1);
            user.setPassword("");
            user.setIsDeleted(false);
            userRepository.save(user);
        }
        response.put("success", true);
        response.put("message", "Đăng nhập social thành công");
        response.put("user", Map.of(
                "id", user.getUserId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", user.getRole()
        ));
        return response;
    }



    @GetMapping
    public List<Users> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public Optional<Users> getUser(@PathVariable int id) {
        return userService.getUser(id);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Users user) {

        Map<String, Object> response = new HashMap<>();

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            response.put("message", "Email đã được đăng ký!");
            return ResponseEntity.badRequest().body(response);
        }
        user.setRole(1);
        user.setPassword(userService.hashPassword(user.getPassword()));
        Users savedUser = userService.save(user);
        response.put("message", "Đăng ký thành công!");
        response.put("userId", savedUser.getUserId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {

        Map<String, Object> response = new HashMap<>();

        String email = body.get("email");
        String password = body.get("password");

        var userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Email không tồn tại!");
            return response;
        }
        Users user = userOpt.get();
        if (user.getIsDeleted()) {
            response.put("success", false);
            response.put("message", "Tài khoản đã bị khóa!");
            return response;
        }

        if (!user.getPassword().equals(userService.hashPassword(password))) {
            response.put("message", "Mật khẩu không đúng!");
            return response;
        }
        response.put("success", true);
        response.put("message", "Đăng nhập thành công!");
        response.put("user", Map.of(
                "id", user.getUserId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", user.getRole()
        ));
        return response;
    }

    @PutMapping("/update/{id}")
    public Map<String, Object> updateUser(@PathVariable int id, @RequestBody Users updated) {
        Map<String, Object> response = new HashMap<>();
        var userOpt = userService.getUser(id);

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Không tìm thấy người dùng!");
            return response;
        }

        Users user = userOpt.get();
        user.setFullName(updated.getFullName());
        user.setEmail(updated.getEmail());
        user.setPhone(updated.getPhone());
        user.setAddress(updated.getAddress());
        user.setDateOfBirth(updated.getDateOfBirth());

        userService.save(user);

        response.put("success", true);
        response.put("message", "Cập nhật thành công!");
        response.put("user", user);
        return response;
    }

    @GetMapping("/check-email")
    public Map<String, Object> checkEmail(@RequestParam String email) {
        boolean exists = userRepository.findByEmail(email).isPresent();
        return Map.of("exists", exists);
    }

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody ResetPasswordRequest req) {

        String email = req.getEmail();
        String newPassword = req.getNewPassword();

        var userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return Map.of("message", "Email không tồn tại.");
        }

        Users user = userOpt.get();
        user.setPassword(userService.hashPassword(newPassword));
        userService.save(user);

        return Map.of("message", "Đặt lại mật khẩu thành công!");
    }
}
