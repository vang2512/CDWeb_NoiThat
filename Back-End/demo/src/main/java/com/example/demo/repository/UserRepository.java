package com.example.demo.repository;

import com.example.demo.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Integer> {
    Optional<Users> findByEmail(String email);
    // chỉ lấy user chưa bị xóa
    List<Users> findByIsDeletedFalse();
    @Query("SELECT COUNT(u) FROM Users u WHERE u.role = 1 AND u.isDeleted = false")
    Long countCustomers();
}
