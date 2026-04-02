package com.example.demo.controller;
import com.example.demo.dto.ReviewResponse;
import com.example.demo.entity.Product;
import com.example.demo.entity.Review;
import com.example.demo.entity.Users;
import com.example.demo.repository.FoodRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodRepository foodRepository;

    @PostMapping("/add-review")
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> body) {
        try {
            int userId = (int) body.get("userId");
            int foodId = (int) body.get("foodId");
            int rating = (int) body.get("rating");
            String comment = (String) body.get("comment");

            Users user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Product food = foodRepository.findById(foodId)
                    .orElseThrow(() -> new RuntimeException("Food not found"));

            Review review = new Review();
            review.setUser(user);
            review.setFood(food);
            review.setRating(rating);
            review.setComment(comment);
            review.setCreatedAt(LocalDateTime.now());

            Review saved = reviewRepository.save(review);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviewsByProduct(@PathVariable int productId) {

        List<Review> reviews =
                reviewRepository.findVisibleReviewsByFoodId(productId);

        List<ReviewResponse> result = new ArrayList<>();

        for (Review r : reviews) {
            result.add(new ReviewResponse(
                    r.getId(),
                    r.getUser().getUserId(),
                    r.getUser().getFullName(),
                    r.getFood().getId(),
                    r.getRating(),
                    r.getComment(),
                    r.getCreatedAt()
            ));
        }
        return ResponseEntity.ok(result);
    }
}