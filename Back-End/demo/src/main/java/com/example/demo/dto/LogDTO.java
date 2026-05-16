package com.example.demo.dto;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class LogDTO {

    private Long id;
    private String type;
    private String action;
    private String module;
    private String username;
    private String message;
    private String ipAddress;
    private LocalDateTime createdAt;

    public LogDTO(Long id, String type, String action, String module,
                  String username, String message, String ipAddress,
                  LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.action = action;
        this.module = module;
        this.username = username;
        this.message = message;
        this.ipAddress = ipAddress;
        this.createdAt = createdAt;
    }

    // getters (bắt buộc nếu không dùng Lombok)
}