package com.example.demo.controller;
import com.example.demo.dto.ReviewResponse;
import com.example.demo.entity.Product;
import com.example.demo.entity.Review;
import com.example.demo.entity.Users;
import com.example.demo.repository.FoodRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/add-review")
    public ResponseEntity<?> addReview(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        try {

            Integer foodId = (Integer) body.get("foodId");
            Integer rating = (Integer) body.get("rating");
            String comment = (String) body.get("comment");

            System.out.println("========== REVIEW DEBUG ==========");
            System.out.println("FoodId: " + foodId);
            System.out.println("Rating: " + rating);
            System.out.println("Comment: " + comment);

            String email = authentication.getName();
            System.out.println("Email JWT: " + email);

            Users user = userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

            System.out.println("User found: " + user.getUserId());

            System.out.println("Checking food...");
            System.out.println("Food exists? "
                    + foodRepository.existsById(foodId));

            Product food = foodRepository.findById(foodId)
                    .orElseThrow(() ->
                            new RuntimeException("Food not found"));

            System.out.println("Food found: " + food.getId());

            Review review = new Review();
            review.setUser(user);
            review.setFood(food);
            review.setRating(rating);
            review.setComment(comment);
            review.setCreatedAt(LocalDateTime.now());
            review.setIsHidden(false);

            Review saved = reviewService.createReview(review);

            System.out.println("Review saved: " + saved.getId());
            System.out.println("================================");

            return ResponseEntity.ok(saved);

        } catch (Exception e) {

            e.printStackTrace(); // QUAN TRỌNG

            return ResponseEntity.badRequest()
                    .body("Error: " + e.getMessage());
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