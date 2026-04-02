package com.example.demo.dto;

import java.time.LocalDateTime;

public class ReviewResponse {
    private Integer id;
    private Integer userId;
    private String userName;
    private Integer foodId;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;

    public ReviewResponse(Integer id, Integer userId, String userName,
                          Integer foodId, int rating, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.foodId = foodId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }
    public ReviewResponse() {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.foodId = foodId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    // Getters
    public Integer getId() { return id; }
    public Integer getUserId() { return userId; }
    public String getUserName() { return userName; }
    public Integer getFoodId() { return foodId; }
    public int getRating() { return rating; }
    public String getComment() { return comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
