package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FoodService {

    @Autowired
    private FoodRepository foodRepository;

    public List<Product> getFlashSaleProducts() {
        return foodRepository
                .findByIsDeletedFalseAndDiscountGreaterThanOrderByDiscountDesc(
                        0,
                        PageRequest.of(0, 10)
                );
    }
    public List<Product> getTopSellingProducts() {
        return foodRepository
                .findByIsDeletedFalseOrderByQuantitySoldDesc(
                        PageRequest.of(0, 10)
                );
    }
    public Product getProductDetail(int id) {
        return foodRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return foodRepository.findTop10ByNameStartingWithIgnoreCase(keyword.trim());
    }
}