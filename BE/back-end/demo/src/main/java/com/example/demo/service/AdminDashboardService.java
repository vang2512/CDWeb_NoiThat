package com.example.demo.service;

import com.example.demo.dto.DailyRevenueDTO;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.OrderDetailRepository;
import com.example.demo.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class AdminDashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> data = new HashMap<>();

        data.put("totalOrders", orderRepository.countDeliveredOrders());
        data.put("totalRevenue", orderRepository.sumDeliveredRevenue());
        data.put("totalFoodSold", orderDetailRepository.sumDeliveredFoodQuantity());
        data.put("totalCustomers", userRepository.countCustomers());
        data.put("pendingOrders", orderRepository.countPendingOrders());
        data.put("deliveringOrders", orderRepository.countDeliveringOrders());
        data.put("averageRating", reviewRepository.getAverageRating());
        data.put("totalReviews", reviewRepository.countVisibleReviews());

        List<Object[]> rawData = orderRepository.getRevenueLast7Days();
        Map<LocalDate, Double> revenueMap = new HashMap<>();
        for (Object[] row : rawData) {
            java.sql.Date sqlDate = (java.sql.Date) row[0];
            LocalDate localDate = sqlDate.toLocalDate();
            Double revenue = ((Number) row[1]).doubleValue();

            revenueMap.put(localDate, revenue);
        }
        List<DailyRevenueDTO> revenue7Days = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            revenue7Days.add(
                    new DailyRevenueDTO(
                            day.toString(),
                            revenueMap.getOrDefault(day, 0.0)
                    )
            );
        }
        data.put("revenue7Days", revenue7Days);

        return data;
    }

}

