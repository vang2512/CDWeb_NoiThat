package com.example.demo.repository;

import com.example.demo.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface FoodRepository
        extends JpaRepository<Product, Integer>,
        JpaSpecificationExecutor<Product> {

    List<Product> findByCategoryId(int categoryId);

    Product findTopByOrderByPriceDesc();

    @Query("""
        SELECT f FROM Product f
        JOIN OrderDetail od ON od.food.id = f.id
        GROUP BY f.id
        ORDER BY SUM(od.quantity) DESC
    """)
    List<Product> findTopSellingFood(Pageable pageable);

    @Query("""
        SELECT f FROM Product f
        JOIN Review r ON f.id = r.food.id
        GROUP BY f.id
        ORDER BY AVG(r.rating) DESC
    """)
    List<Product> findTopRatedFood(Pageable pageable);

    List<Product> findByIsDeletedFalse();
    // loard top 10 sản phẩm có discount cao
    List<Product> findByIsDeletedFalseAndDiscountGreaterThanOrderByDiscountDesc(int discount, Pageable pageable);
    // loard top 10 sa phẩm bán chạy theo tt quatity_sold
    List<Product> findByIsDeletedFalseOrderByQuantitySoldDesc(Pageable pageable);
    // loard các thông tin liên quan đến chi tiết sản phẩm
    Optional<Product> findByIdAndIsDeletedFalse(int id);


    List<Product> findTop10ByNameStartingWithIgnoreCase(String name);



}
