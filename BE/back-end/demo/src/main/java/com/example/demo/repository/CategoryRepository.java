package com.example.demo.repository;

import com.example.demo.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    // Lấy danh mục chưa bị xóa mềm
    List<Category> findByIsDeletedFalse();

    // Kiểm tra tên danh mục đã tồn tại chưa (trừ những danh mục đã xóa mềm)
    boolean existsByCategoryNameAndIsDeletedFalse(String categoryName);

    // Tìm danh mục theo tên (không phân biệt hoa thường, chưa xóa)
    List<Category> findByCategoryNameContainingIgnoreCaseAndIsDeletedFalse(String categoryName);
}
