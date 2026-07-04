package com.example.demo.repository;

import com.example.demo.dto.CategoryStatisticDTO;
import com.example.demo.model.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
    SELECT COUNT(f)
    FROM Product f
    WHERE f.isDeleted = false
""")
    Long countTotalProducts();
    @Query(value = """
    SELECT 
        p.id,
        p.name,
        p.price,
        p.img,
        SUM(od.quantity) AS totalSold,
        SUM(od.quantity * od.unit_price) AS revenue
    FROM orderdetails od
    JOIN products p ON od.food_id = p.id
    JOIN orders o ON od.order_id = o.id
    WHERE o.status = 'Đã giao'
      AND YEAR(o.date) = :year
    GROUP BY p.id, p.name, p.price, p.img
    ORDER BY totalSold DESC
    LIMIT 5
""", nativeQuery = true)
    List<Object[]> getTopSellingProducts(@Param("year") int year);
    @Query("""
    SELECT new com.example.demo.dto.CategoryStatisticDTO(
        c.categoryName,
        COUNT(p.id)
    )
    FROM Product p
    JOIN p.category c
    WHERE p.isDeleted = false
    AND c.isDeleted = false
    GROUP BY c.categoryName
""")
    List<CategoryStatisticDTO> getCategoryStatistics();

}
