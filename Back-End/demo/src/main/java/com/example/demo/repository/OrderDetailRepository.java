package com.example.demo.repository;
import com.example.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    @Query("""
        SELECT COALESCE(SUM(od.quantity), 0)
        FROM OrderDetail od
        JOIN od.order o
        WHERE o.status = 'Đã giao'
    """)
    Long sumDeliveredFoodQuantity();
    @Query(
            value = """
    SELECT 
        fc.category_name AS category_name,
        COALESCE(SUM(od.quantity * od.unit_price), 0) AS revenue
    FROM orderdetails od
    JOIN products p 
        ON od.food_id = p.id
    JOIN food_category fc 
        ON p.categoryid = fc.id
    JOIN orders o 
        ON od.order_id = o.id
    WHERE o.status = 'Đã giao'
      AND YEAR(o.date) = :year
      AND p.is_deleted = false
      AND fc.is_deleted = false
    GROUP BY fc.id, fc.category_name
    ORDER BY revenue DESC
""",
            nativeQuery = true
    )
    List<Object[]> getRevenueByCategory(
            @Param("year") int year
    );
}

