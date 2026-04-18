package com.example.demo.repository;

import com.example.demo.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    // Điểm đánh giá trung bình
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r")
    Double getAverageRating();

    // Tổng số đánh giá
    @Query("SELECT COUNT(r) FROM Review r")
    Long countVisibleReviews();

    @Query("""
        SELECT r FROM Review r
        JOIN FETCH r.user
        JOIN FETCH r.food
        WHERE r.food.id = :foodId
          AND r.isHidden = false
        ORDER BY r.createdAt DESC
    """)
    List<Review> findVisibleReviewsByFoodId(@Param("foodId") int foodId);

    @Query("""
        SELECT r FROM Review r
        JOIN FETCH r.user
        JOIN FETCH r.food
        ORDER BY r.createdAt DESC
    """)
    List<Review> findAllWithUserAndFood();
    List<Review> findByFood_Id(int productId);
}
