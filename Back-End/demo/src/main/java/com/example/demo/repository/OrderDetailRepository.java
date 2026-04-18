package com.example.demo.repository;
import com.example.demo.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    @Query("""
        SELECT COALESCE(SUM(od.quantity), 0)
        FROM OrderDetail od
        JOIN od.order o
        WHERE o.status = 'Đã giao'
    """)
    Long sumDeliveredFoodQuantity();
}

