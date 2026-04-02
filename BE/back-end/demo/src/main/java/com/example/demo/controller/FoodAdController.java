package com.example.demo.controller;

import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.FoodRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/foods")
@CrossOrigin
public class FoodAdController {

    private final FoodRepository foodRepository;
    private final CategoryRepository categoryRepository;
    public FoodAdController(FoodRepository foodRepository, CategoryRepository categoryRepository) {
        this.foodRepository = foodRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<Product> getAllFoods() {
        return foodRepository.findByIsDeletedFalse();
    }
    // Xóa sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFood(@PathVariable int id) {

        Product food = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found"));
        food.setIsDeleted(true);
        foodRepository.save(food);
        return ResponseEntity.ok().build();
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public Product createFood(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("quantity") int quantity,
            @RequestParam("categoryId") int categoryId,
            @RequestParam("imgUrl") String imgUrl
    ) {

        Product food = new Product();
        food.setName(name);
        food.setDescription(description);
        food.setPrice(price);
        food.setQuantity(quantity);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        food.setCategory(category);
        food.setImg(imgUrl);

        return foodRepository.save(food);
    }
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public Product updateFood(
            @PathVariable int id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("quantity") int quantity,
            @RequestParam("categoryId") int categoryId,
            @RequestParam("imgUrl") String imgUrl
    ) {
        Product food = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found"));

        food.setName(name);
        food.setDescription(description);
        food.setPrice(price);
        food.setQuantity(quantity);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        food.setCategory(category);

        food.setImg(imgUrl); // cập nhật link ảnh

        return foodRepository.save(food);
    }
}
