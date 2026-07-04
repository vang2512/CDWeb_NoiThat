package com.example.demo.service;

import com.example.demo.model.Review;
import com.example.demo.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SentimentAnalysisService sentimentAnalysisService;


    public ReviewService(ReviewRepository reviewRepository, SentimentAnalysisService sentimentAnalysisService) {
        this.reviewRepository = reviewRepository;
        this.sentimentAnalysisService = sentimentAnalysisService;
    }
    // Load danh sách review cua nguoi dung
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
    public Review createReview(Review review) {
        String sentiment =
                sentimentAnalysisService
                        .analyze(review.getComment());
        review.setSentiment(sentiment);

        return reviewRepository.save(review);
    }

}
