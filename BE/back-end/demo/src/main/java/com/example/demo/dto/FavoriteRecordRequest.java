package com.example.demo.dto;

public class FavoriteRecordRequest {
    public int id;
    public int userId;
    public String slug;

    public FavoriteRecordRequest() {}

    public FavoriteRecordRequest(int id, int userId, String slug) {
        this.id = id;
        this.userId = userId;
        this.slug = slug;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }
}
