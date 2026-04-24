package com.example.demo.service;

import com.example.demo.dto.MultipartInputStreamFileResource;
import com.example.demo.entity.Product;
import com.example.demo.entity.Product;
import com.example.demo.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
@Service
public class ImageService {

    @Autowired
    private FoodRepository foodRepository;

    private final String FASTAPI_URL = "http://localhost:8000/search-image";

    public List<Product> searchByImage(MultipartFile file) throws IOException {

        RestTemplate restTemplate = new RestTemplate();

        // 👉 timeout (khuyên dùng)
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        restTemplate.setRequestFactory(factory);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

        HttpEntity<MultiValueMap<String, Object>> requestEntity =
                new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                FASTAPI_URL,
                requestEntity,
                Map.class
        );

        if (response.getBody() == null) {
            throw new RuntimeException("AI response null");
        }

        List<Map<String, Object>> products =
                (List<Map<String, Object>>) response.getBody().get("foods");

        List<Product> resultFoods = new ArrayList<>();

        if (products == null) return resultFoods;

        // 👉 giữ thứ tự ưu tiên từ AI
        for (Map<String, Object> p : products) {

            int productId = ((Number) p.get("food_id")).intValue();
            double score = ((Number) p.get("score")).doubleValue();

            Optional<Product> foodOpt = foodRepository.findById(productId);

            if (foodOpt.isPresent()) {
                Product product = foodOpt.get();

                product.setIsRecommended(true);
                product.setRecommendationScore(score);
                product.setRecommendationReason("Similar image");

                resultFoods.add(product);
            }
        }

        return resultFoods;
    }
}