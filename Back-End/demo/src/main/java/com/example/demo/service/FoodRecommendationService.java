package com.example.demo.service;

import com.example.demo.entity.Category;
import com.example.demo.entity.Product;  // Sửa import này
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class FoodRecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(FoodRecommendationService.class);

    @Value("${fastapi.url:http://localhost:8000}")
    private String fastApiUrl;

    @Autowired
    private RestTemplate restTemplate;

    public List<Product> getRecommendedFoods(Integer userId, Integer limit) {
        if (userId == null) {
            logger.warn("User ID is null, cannot get recommendations");
            return new ArrayList<>();
        }

        try {
            // 1. Chuẩn bị request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("user_id", userId);
            requestBody.put("limit", limit != null ? limit : 10);
            requestBody.put("include_food_info", true);

            HttpEntity<Map<String, Object>> requestEntity =
                    new HttpEntity<>(requestBody, headers);

            logger.info("Calling FastAPI for user {} with limit {}", userId, limit);

            // 2. Gọi FastAPI
            ResponseEntity<Map> response = restTemplate.exchange(
                    fastApiUrl + "/recommend",
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            // 3. Xử lý response
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();

                if (responseBody != null && responseBody.containsKey("recommendations")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> recommendations =
                            (List<Map<String, Object>>) responseBody.get("recommendations");

                    if (recommendations != null && !recommendations.isEmpty()) {
                        return convertToFoods(recommendations);
                    }
                }
            }

        } catch (Exception e) {
            logger.error("Error calling FastAPI: {}", e.getMessage());
        }

        return new ArrayList<>();
    }

    /**
     * Chuyển đổi từ FastAPI response sang Food objects
     */
    private List<Product> convertToFoods(List<Map<String, Object>> recommendations) {
        List<Product> foods = new ArrayList<>();

        logger.info("Starting to convert {} recommendations", recommendations.size());

        for (int i = 0; i < recommendations.size(); i++) {
            Map<String, Object> rec = recommendations.get(i);

            try {
                Product food = new Product();
                logger.info("Converting recommendation {}: food_id={}", i+1, rec.get("food_id"));

                // 1. food_id
                Object foodIdObj = rec.get("food_id");
                if (foodIdObj != null) {
                    food.setId(((Number) foodIdObj).intValue());
                    logger.info(" Set id: {}", food.getId());
                }

                // 2. name
                String name = (String) rec.get("name");
                food.setName(name);
                logger.info("  Set name: {}", name);

                // 3. price
                Object priceObj = rec.get("price");
                if (priceObj != null) {
                    food.setPrice(((Number) priceObj).doubleValue());
                    logger.info(" Set price: {}", food.getPrice());
                }

                // 4. image_url -> img
                Object imgObj = rec.get("image_url");
                if (imgObj != null) {
                    food.setImg(imgObj.toString());
                    logger.info("  Set img from image_url: {}", food.getImg());
                }

                // 5. description
                Object descObj = rec.get("description");
                if (descObj != null) {
                    food.setDescription(descObj.toString());
                    logger.info(" Set description: {}", food.getDescription());
                }

                // 6. XỬ LÝ CATEGORY OBJECT (QUAN TRỌNG)
                Object categoryObj = rec.get("category");
                if (categoryObj != null && categoryObj instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> categoryMap = (Map<String, Object>) categoryObj;

                    // Tạo Category object
                    Category category = new Category();

                    // Lấy id từ category object
                    Object categoryIdObj = categoryMap.get("id");
                    if (categoryIdObj != null) {
                        category.setId(((Number) categoryIdObj).intValue());
                    }

                    // Lấy categoryName từ category object
                    Object categoryNameObj = categoryMap.get("categoryName");
                    if (categoryNameObj != null) {
                        category.setCategoryName(categoryNameObj.toString());
                    }

                    // Lấy img từ category object
                    Object categoryImgObj = categoryMap.get("img");
                    if (categoryImgObj != null) {
                        category.setImg(categoryImgObj.toString());
                    }

                    food.setCategory(category);
                    logger.info(" Set category object: id={}, name={}",
                            category.getId(), category.getCategoryName());
                } else {
                    // Fallback: tạo category mặc định
                    Category defaultCategory = new Category();
                    defaultCategory.setId(0);
                    defaultCategory.setCategoryName("Unknown");
                    food.setCategory(defaultCategory);
                    logger.warn(" Category is not an object, using default");
                }

                food.setIsRecommended(true);
                logger.info(" SET isRecommended = TRUE");

                // 7. score
                Object scoreObj = rec.get("score");
                if (scoreObj != null && scoreObj instanceof Number) {
                    food.setRecommendationScore(((Number) scoreObj).doubleValue());
                    logger.info(" Set recommendationScore: {}", food.getRecommendationScore());
                }

                // Kiểm tra final food object
                logger.info(" Created Food: id={}, name={}, categoryId={}, isRecommended={}",
                        food.getId(), food.getName(),
                        food.getCategory() != null ? food.getCategory().getId() : "null",
                        food.getIsRecommended());

                foods.add(food);

            } catch (Exception e) {
                logger.error(" Error converting recommendation {}: {}", i+1, e.getMessage());
                e.printStackTrace();
            }
        }

        logger.info(" Successfully converted {} Food objects", foods.size());
        return foods;
    }

    /**
     * Kiểm tra kết nối FastAPI
     */
    public boolean checkFastApiConnection() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                    fastApiUrl + "/health",
                    String.class
            );
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            logger.error("Cannot connect to FastAPI: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Phương thức mới: Lấy danh sách ID của recommended foods
     */
    public Set<Integer> getRecommendedFoodIds(Integer userId, Integer limit) {
        List<Product> recommendedFoods = getRecommendedFoods(userId, limit);
        Set<Integer> recommendedIds = new HashSet<>();

        for (Product food : recommendedFoods) {
            recommendedIds.add(food.getId());
        }
        return recommendedIds;
    }
}