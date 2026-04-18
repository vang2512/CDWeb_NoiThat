package com.example.demo.controller;


import com.example.demo.entity.Review;
import com.example.demo.service.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reviews")
@CrossOrigin(origins = "*")
public class ReviewAdminController {

    private final ReviewService reviewService;

    public ReviewAdminController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @PutMapping("/{id}/toggle")
    public Map<String, Object> toggleReview(@PathVariable Integer id) {
        boolean success = reviewService.toggleVisibility(id);
        return Map.of(
                "success", success,
                "message", "Toggle review visibility successfully"
        );
    }
}

