package com.example.demo.service;

import com.example.demo.dto.VoiceSearchIntent;
import com.example.demo.entity.Product;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

public class FoodSpecification {

    public static Specification<Product> filter(VoiceSearchIntent intent) {
        return (root, query, cb) -> {

            Predicate predicate = cb.conjunction();
            predicate = cb.and(predicate,
                    cb.equal(root.get("isDeleted"), false));

            if (intent.getFoodName() != null) {
                predicate = cb.and(predicate,
                        cb.like(cb.lower(root.get("name")),
                                "%" + intent.getFoodName().toLowerCase() + "%"));
            }
            // ===== DANH MỤC =====
            if (intent.getCategoryName() != null) {
                Join<Object, Object> category = root.join("category");
                predicate = cb.and(predicate,
                        cb.like(cb.lower(category.get("categoryName")),
                                "%" + intent.getCategoryName().toLowerCase() + "%"));
            }
            // ===== GIÁ =====
            if (intent.getMinPrice() != null) {
                predicate = cb.and(predicate,
                        cb.greaterThanOrEqualTo(root.get("price"), intent.getMinPrice()));
            }
            if (intent.getMaxPrice() != null) {
                predicate = cb.and(predicate,
                        cb.lessThanOrEqualTo(root.get("price"), intent.getMaxPrice()));
            }
            // ===== SORT =====
            if ("cheapest".equals(intent.getPriceType())) {
                query.orderBy(cb.asc(root.get("price")));
            }
            if ("most_expensive".equals(intent.getPriceType())) {
                query.orderBy(cb.desc(root.get("price")));
            }
            return predicate;
        };
    }
}
