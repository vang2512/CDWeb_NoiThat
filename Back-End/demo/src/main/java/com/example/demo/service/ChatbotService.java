package com.example.demo.service;

import com.example.demo.dto.LlmIntent;
import com.example.demo.entity.Product;
import com.example.demo.entity.Order;
import com.example.demo.repository.FoodRepository;
import com.example.demo.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class ChatbotService {

    @Autowired
    private FoodRepository foodRepo;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private LlmService llmService;


    public Map<String, Object> getReply(String message, int userId) {

        Map<String, Object> response = new HashMap<>();

        LlmIntent intent = llmService.extractIntent(message);

        if (Boolean.TRUE.equals(intent.getOrderQuery())) {
            // Nhứng đơn hàng đang giao
            if ("shipping".equals(intent.getOrderStatus())) {
                List<Order> orders =
                        orderRepo.findByUserIdAndStatus(userId, "Đang giao");

                response.put("reply",
                        orders.isEmpty()
                                ? "Bạn không có đơn hàng nào đang giao."
                                : intent.getReply());

                response.put("orders", convertOrders(orders));
                return response;
            }

            // Những đơn hàng đang xử lý
            if ("processing".equals(intent.getOrderStatus())) {
                List<Order> orders =
                        orderRepo.findByUserIdAndStatus(userId, "Đang xử lý");

                response.put("reply",
                        orders.isEmpty()
                                ? "Bạn không có đơn hàng nào đang xử lý."
                                : intent.getReply());

                response.put("orders", convertOrders(orders));
                return response;
            }
            //
            if ("completed".equals(intent.getOrderStatus())) {
                List<Order> orders =
                        orderRepo.findByUserIdAndStatus(userId, "Đã giao");

                response.put("reply",
                        orders.isEmpty()
                                ? "Bạn chưa có đơn hàng nào đã giao."
                                : intent.getReply());

                response.put("orders", convertOrders(orders));
                return response;
            }

            // 2.3 TRA CỨU THEO NGÀY
            if (intent.getDate() != null) {
                LocalDate date;

                try {
                    date = parseFlexibleDate(intent.getDate());
                } catch (Exception e) {
                    response.put("reply",
                            "Ngày bạn nhập chưa đúng định dạng. Ví dụ: 12/12/2025 hoặc 2025-12-12.");
                    return response;
                }

                List<Order> orders =
                        orderRepo.findByUserIdAndDate(userId, date);

                response.put("reply",
                        orders.isEmpty()
                                ? "Không tìm thấy đơn hàng vào ngày " + intent.getDate()
                                : intent.getReply());

                response.put("orders", convertOrders(orders));
                return response;
            }

            // 2.4 KHÔNG RÕ TRẠNG THÁI → TRẢ TẤT CẢ ĐƠN HIỆN TẠI
            List<Order> orders =
                    orderRepo.findByUserIdAndStatusIn(
                            userId, List.of("Đang xử lý", "Đang giao", "Đã giao"));

            response.put("reply",
                    orders.isEmpty()
                            ? "Hiện bạn không có đơn hàng nào đang xử lý hoặc đang giao hay đã giao."
                            : intent.getReply());

            response.put("orders", convertOrders(orders));
            return response;
        }

        if (Boolean.TRUE.equals(intent.getProductQuery())) {
            Product food = null;
            switch (intent.getProductType()) {
                case "top_selling":
                   food = foodRepo.findTopSellingFood(PageRequest.of(0, 1))
                            .stream().findFirst().orElse(null);
                    break;

                case "top_rated":
                    food = foodRepo.findTopRatedFood(PageRequest.of(0, 1))
                            .stream().findFirst().orElse(null);
                    break;

                case "highest_price":
                    food = foodRepo.findTopByOrderByPriceDesc();
                    break;

                default:
                    food = foodRepo.findTopSellingFood(PageRequest.of(0, 1))
                            .stream().findFirst().orElse(null);
            }
            if (food == null) {
                response.put("reply", "Hiện chưa có sản phẩm phù hợp để gợi ý.");
                return response;
            }
            response.put("reply", intent.getReply());
            response.put("product", Map.of(
                    "id", food.getId(),
                    "name", food.getName(),
                    "price", food.getPrice(),
                    "img", food.getImg(),
                    "categoryName",
                    food.getCategory() != null
                            ? food.getCategory().getCategoryName()
                            : ""
            ));
            return response;
        }
        response.put("reply", intent.getReply());
        return response;
    }

    private List<Map<String, Object>> convertOrders(List<Order> orders) {
        List<Map<String, Object>> result = new ArrayList<>();

        for (Order o : orders) {
            Map<String, Object> ord = new HashMap<>();
            ord.put("orderId", o.getId());
            ord.put("status", o.getStatus());
            ord.put("total", o.getTotalAmount());
            ord.put("createdDate", o.getDate().toString());
            result.add(ord);
        }
        return result;
    }


    private LocalDate parseFlexibleDate(String input) {

        List<String> patterns = List.of(
                "dd/MM/yyyy",
                "d/M/yyyy",
                "yyyy-MM-dd"
        );
        for (String pattern : patterns) {
            try {
                return LocalDate.parse(input,
                        DateTimeFormatter.ofPattern(pattern));
            } catch (DateTimeParseException ignored) {}
        }
        throw new RuntimeException("Invalid date format");
    }
}
