package com.example.demo.controller;

import com.example.demo.dto.ReviewResponse;
import com.example.demo.entity.Product;
import com.example.demo.entity.Review;
import com.example.demo.repository.FoodRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.service.FoodRecommendationService;
import com.example.demo.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "*")
public class FoodController {

    @Autowired
    private FoodRepository foodRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private FoodRecommendationService recommendationService;
    @Autowired
    private FoodService foodService;
    @GetMapping
    public List<Product> getAllFoods() {
        return foodRepository.findByIsDeletedFalse();
    }
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam("name") String name
    ) {
        List<Product> results = foodService.searchProducts(name);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/with-recommendations")
    public ResponseEntity<?> getAllFoodsWithRecommendations(
            @RequestParam(required = false) Integer userId,
            @RequestParam(defaultValue = "8") Integer limit) {

        try {
            List<Product> allFoods = foodRepository.findByIsDeletedFalse();

            List<Product> recommendedFoods = new ArrayList<>();
            Set<Integer> recommendedIds = new HashSet<>();

            if (userId != null) {
                recommendedFoods = recommendationService.getRecommendedFoods(userId, limit);
                for (Product recFood : recommendedFoods) {
                    recommendedIds.add(recFood.getId());
                }
            }
            List<Product> otherFoods = new ArrayList<>();
            for (Product food : allFoods) {
                if (!recommendedIds.contains(food.getId())) {
                    otherFoods.add(food);
                }
            }
            List<Product> finalList = new ArrayList<>();
            finalList.addAll(recommendedFoods);
            finalList.addAll(otherFoods);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", finalList);
            response.put("total", finalList.size());
            response.put("recommendedCount", recommendedFoods.size());
            response.put("userId", userId);
            response.put("message", "Successfully loaded foods with recommendations");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error getting foods with recommendations");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }


    @GetMapping("/recommended")
    public ResponseEntity<?> getRecommendedFoods(
            @RequestParam Integer userId,
            @RequestParam(defaultValue = "10") Integer limit) {

        try {
            List<Product> recommendedFoods = recommendationService.getRecommendedFoods(userId, limit);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", recommendedFoods);
            response.put("total", recommendedFoods.size());
            response.put("userId", userId);
            response.put("limit", limit);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error getting recommendations");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * 4. API MỚI: Kiểm tra kết nối FastAPI
     */
    @GetMapping("/check-recommendation-service")
    public ResponseEntity<?> checkRecommendationService() {
        boolean isConnected = recommendationService.checkFastApiConnection();

        Map<String, Object> response = new HashMap<>();
        response.put("fastApiConnected", isConnected);
        response.put("fastApiUrl", "http://localhost:8000");
        response.put("timestamp", new Date());
        response.put("status", isConnected ? "CONNECTED" : "DISCONNECTED");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/byCategory/{categoryId}")
    public List<Product> getByCategory(@PathVariable int categoryId) {
        return foodRepository.findByCategoryId(categoryId);
    }
//    @GetMapping("/{id}")
//    public Optional<Product> getFoodById(@PathVariable int id) {
//        return foodRepository.findById(id);
//    }

    @GetMapping("/{id}/reviews")
    public List<ReviewResponse> getReviewsByFood(@PathVariable int id) {

        List<Review> reviews =
                reviewRepository.findVisibleReviewsByFoodId(id);

        return reviews.stream().map(r -> new ReviewResponse(
                r.getId(),
                r.getUser().getUserId(),
                r.getUser().getFullName(),
                r.getFood().getId(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        )).toList();
    }
    @GetMapping("/flash-sale")
    public ResponseEntity<?> getFlashSaleProducts() {
        return ResponseEntity.ok(foodService.getFlashSaleProducts());
    }
    @GetMapping("/top-selling")
    public ResponseEntity<?> getTopSellingProducts() {
        return ResponseEntity.ok(foodService.getTopSellingProducts());
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductDetail(@PathVariable int id) {
        Product product = foodService.getProductDetail(id);
        return ResponseEntity.ok(product);
    }

}
