package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.service.AdminDashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }
}

