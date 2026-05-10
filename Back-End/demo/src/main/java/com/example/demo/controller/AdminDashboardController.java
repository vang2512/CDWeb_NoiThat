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
    @GetMapping("/revenue-by-month")
    public ResponseEntity<?> getRevenueByMonth(
            @RequestParam int year
    ) {
        return ResponseEntity.ok(
                dashboardService.getRevenueByMonth(year)
        );
    }
    @GetMapping("/revenue-by-category")
    public ResponseEntity<?> getRevenueByCategory(
            @RequestParam int year
    ) {
        return ResponseEntity.ok(
                dashboardService.getRevenueByCategory(year)
        );
    }
    @GetMapping("/top-selling-products")
    public ResponseEntity<?> getTopSellingProducts(
            @RequestParam int year
    ) {

        return ResponseEntity.ok(
                dashboardService.getTopSellingProducts(year)
        );
    }
    @GetMapping("/category-statistics")
    public ResponseEntity<?> getCategoryStatistics() {

        return ResponseEntity.ok(
                dashboardService.getCategoryStatistics()
        );
    }
    @GetMapping("/recent-orders")
    public ResponseEntity<?> getRecentOrders() {

        return ResponseEntity.ok(
                dashboardService.getTop5RecentOrders()
        );
    }
}

