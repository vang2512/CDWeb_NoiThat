package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class AdminDashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private FoodRepository foodRepository;

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
        data.put("totalProducts", foodRepository.countTotalProducts());
        data.put("totalCustomers", userRepository.countCustomers());
        data.put("pendingOrders", orderRepository.countPendingOrders());
        data.put("deliveringOrders", orderRepository.countDeliveringOrders());
        data.put("averageRating", reviewRepository.getAverageRating());
        data.put("totalReviews", reviewRepository.countVisibleReviews());

        return data;
    }
    public List<MonthlyRevenueDTO> getRevenueByMonth(int year) {

        List<Object[]> rawData =
                orderRepository.getRevenueByMonth(year);

        Map<Integer, Object[]> revenueMap = new HashMap<>();

        for (Object[] row : rawData) {

            Integer month = ((Number) row[0]).intValue();

            revenueMap.put(month, row);
        }

        List<MonthlyRevenueDTO> result = new ArrayList<>();

        for (int i = 1; i <= 12; i++) {

            if (revenueMap.containsKey(i)) {

                Object[] row = revenueMap.get(i);

                Double revenue =
                        ((Number) row[1]).doubleValue();

                Long orders =
                        ((Number) row[2]).longValue();

                result.add(
                        new MonthlyRevenueDTO(
                                "Tháng" + i,
                                revenue,
                                orders
                        )
                );

            } else {

                result.add(
                        new MonthlyRevenueDTO(
                                "T" + i,
                                0.0,
                                0L
                        )
                );
            }
        }

        return result;
    }
    public List<CategoryRevenueDTO> getRevenueByCategory(int year) {

        List<Object[]> rawData =
                orderDetailRepository.getRevenueByCategory(year);

        List<CategoryRevenueDTO> result = new ArrayList<>();

        for (Object[] row : rawData) {

            String categoryName = row[0].toString();

            Double revenue =
                    ((Number) row[1]).doubleValue();

            result.add(
                    new CategoryRevenueDTO(
                            categoryName,
                            revenue
                    )
            );
        }

        return result;
    }
    public List<TopSellingProductDTO> getTopSellingProducts(int year) {

        List<Object[]> results =
                foodRepository.getTopSellingProducts(year);

        return results.stream().map(row -> new TopSellingProductDTO(
                ((Number) row[0]).intValue(),
                (String) row[1],
                ((Number) row[2]).doubleValue(),
                (String) row[3],
                ((Number) row[4]).intValue(),
                ((Number) row[5]).doubleValue()
        )).toList();
    }
    public List<CategoryStatisticDTO> getCategoryStatistics() {

        return foodRepository.getCategoryStatistics();
    }
    public List<RecentOrderDTO> getTop5RecentOrders() {

        return orderRepository.getRecentOrders(
                PageRequest.of(0, 5)
        );
    }
    public SentimentStatisticDTO getSentimentStatistics() {

        long positive =
                reviewRepository.countBySentimentAndIsHiddenFalse("POS");

        long neutral =
                reviewRepository.countBySentimentAndIsHiddenFalse("NEU");

        long negative =
                reviewRepository.countBySentimentAndIsHiddenFalse("NEG");

        System.out.println("=== SENTIMENT DEBUG ===");
        System.out.println("POS: " + positive);
        System.out.println("NEU: " + neutral);
        System.out.println("NEG: " + negative);

        long total = positive + neutral + negative;

        System.out.println("TOTAL: " + total);

        if (total == 0) {
            System.out.println("WARNING: TOTAL = 0 => DB không có dữ liệu match query");
            return new SentimentStatisticDTO(0,0,0,0,0,0);
        }

        SentimentStatisticDTO dto = new SentimentStatisticDTO(
                positive,
                neutral,
                negative,
                Math.round((positive * 100.0 / total) * 10) / 10.0,
                Math.round((neutral * 100.0 / total) * 10) / 10.0,
                Math.round((negative * 100.0 / total) * 10) / 10.0
        );

        System.out.println("DTO RETURN: " + dto);

        return dto;
    }
    public List<TopSentimentProductDTO> getTopProductsBySentiment(String sentiment){

        return reviewRepository.findTopProductsBySentiment(
                sentiment,
                PageRequest.of(0,5)
        );
    }


}

