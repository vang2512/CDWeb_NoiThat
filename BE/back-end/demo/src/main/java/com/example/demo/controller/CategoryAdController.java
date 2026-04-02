package com.example.demo.controller;

import com.example.demo.entity.Category;
import com.example.demo.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@CrossOrigin
public class CategoryAdController {

    private final CategoryRepository categoryRepository;

    public CategoryAdController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Lấy tất cả danh mục chưa bị xóa
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findByIsDeletedFalse();
    }

    // Tìm kiếm danh mục theo tên
    @GetMapping("/search")
    public List<Category> searchCategories(@RequestParam String keyword) {
        return categoryRepository.findByCategoryNameContainingIgnoreCaseAndIsDeletedFalse(keyword);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public Category createCategory(
            @RequestParam("categoryName") String categoryName,
            @RequestParam("imgUrl") String imgUrl
    )
    {

        if (categoryRepository.existsByCategoryNameAndIsDeletedFalse(categoryName)) {
            throw new RuntimeException("Category name already exists");
        }
        Category category = new Category();
        category.setCategoryName(categoryName);
        category.setImg(imgUrl);
        category.setIsDeleted(false);

        return categoryRepository.save(category);
    }


    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public Category updateCategory(
            @PathVariable int id,
            @RequestParam("categoryName") String categoryName,
            @RequestParam("imgUrl") String imgUrl
    ) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (category.getIsDeleted()) {
            throw new RuntimeException("Category is deleted");
        }
        // check trùng tên
        if (!category.getCategoryName().equals(categoryName)
                && categoryRepository.existsByCategoryNameAndIsDeletedFalse(categoryName)) {
            throw new RuntimeException("Category name already exists");
        }
        category.setCategoryName(categoryName);
        category.setImg(imgUrl);
        return categoryRepository.save(category);
    }

    // Xóa mềm danh mục
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable int id) {
        return categoryRepository.findById(id)
                .map(category -> {
                    if (category.getIsDeleted()) {
                        return ResponseEntity.badRequest().body("Category already deleted");
                    }
                    category.setIsDeleted(true);
                    categoryRepository.save(category);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Khôi phục danh mục đã xóa mềm
    @PostMapping("/{id}/restore")
    public ResponseEntity<?> restoreCategory(@PathVariable int id) {
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setIsDeleted(false);
                    categoryRepository.save(category);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Lấy số lượng danh mục
    @GetMapping("/count")
    public ResponseEntity<Long> getCategoryCount() {
        long count = categoryRepository.findByIsDeletedFalse().size();
        return ResponseEntity.ok(count);
    }
}