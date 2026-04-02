package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userid", nullable = false)
    private Integer userId;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    private String fullName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private Integer role = 1;

    @Column(name = "is_deleted",nullable = false)
    private Boolean isDeleted = false;
    // --- Getters & Setters ---
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Integer getRole() { return role; }
    public void setRole(Integer role) { this.role = role; }
    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
}
