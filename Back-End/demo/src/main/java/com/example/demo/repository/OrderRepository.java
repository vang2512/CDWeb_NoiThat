package com.example.demo.repository;

import com.example.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByUserIdOrderByDateDesc(int userId);

    List<Order> findByStatus(String status);

    List<Order> findByUserIdAndStatusIn(int userId, List<String> statuses);

    List<Order> findByUserIdAndStatus(int userId, String status);

    List<Order> findByUserIdAndDateBetween(int userId, LocalDateTime start, LocalDateTime end);

    default List<Order> findByUserIdAndDate(int userId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        return findByUserIdAndDateBetween(userId, start, end);
    }
    // Tổng số đơn đã giao
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'Đã giao'")
    Long countDeliveredOrders();

    // Tổng doanh thu đơn đã giao
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'Đã giao'")
    BigDecimal sumDeliveredRevenue();

    // Tổng đơn đang xử lý
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'Đang xử lý'")
    Long countPendingOrders();

    // Tổng đơn đang giao
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'Đang giao'")
    Long countDeliveringOrders();

    @Query(
            value = """
        SELECT DATE(o.date), SUM(o.total_amount)
        FROM orders o
        WHERE o.status = 'Đã giao'
          AND o.date >= CURRENT_DATE - INTERVAL '6' DAY
        GROUP BY DATE(o.date)
        ORDER BY DATE(o.date)
    """,
            nativeQuery = true
    )
    List<Object[]> getRevenueLast7Days();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.userId = :userId")
    long countByUserId(@Param("userId") int userId);
}
