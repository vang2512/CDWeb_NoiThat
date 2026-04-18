package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateCommentRequest {
    private Integer userId;
    @NotBlank private String slug;
    private String displayName;
    @NotBlank private String content;
    private String timeAgo;

    // getters/setters
    public CreateCommentRequest() {}

    public CreateCommentRequest(String timeAgo, String content, String displayName, String slug, Integer userId) {
        this.timeAgo = timeAgo;
        this.content = content;
        this.displayName = displayName;
        this.slug = slug;
        this.userId = userId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTimeAgo() {
        return timeAgo;
    }

    public void setTimeAgo(String timeAgo) {
        this.timeAgo = timeAgo;
    }
}
