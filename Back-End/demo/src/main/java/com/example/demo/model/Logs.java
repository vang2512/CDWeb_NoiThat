package com.example.demo.model;

import com.example.demo.config.LogType;
import com.example.demo.config.Status;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "logs")
public class Logs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private LogType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "userid")
    private Users user;

    private String username;

    private String action;

    private String module;

    @Enumerated(EnumType.STRING)
    private Status status = Status.SUCCESS;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String userAgent;

    @Column(columnDefinition = "JSON")
    private String metadata;

    private LocalDateTime createdAt = LocalDateTime.now();

    // getters setters

}