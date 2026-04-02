package com.example.demo.service;

import com.example.demo.entity.Review;
import com.example.demo.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    // Load danh sách review
    public List<Review> getAllReviews() {
        return reviewRepository.findAllWithUserAndFood();
    }

    // Toggle ẩn / hiện review
    public boolean toggleVisibility(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setIsHidden(!review.getIsHidden());
        reviewRepository.save(review);
        return true;
    }
}
