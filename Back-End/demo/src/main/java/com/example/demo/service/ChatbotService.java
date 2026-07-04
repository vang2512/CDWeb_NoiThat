package com.example.demo.service;

import com.example.demo.dto.LlmIntent;
import com.example.demo.model.Category;
import com.example.demo.model.Product;
import com.example.demo.model.Order;
import com.example.demo.repository.FoodRepository;
import com.example.demo.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
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

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // =====================================================
    // 1. MAIN - XỬ LÝ TIN NHẮN (CHỈ GỌI GEMINI 1 LẦN)
    // =====================================================
    public Map<String, Object> getReply(String message, int userId) {
        Map<String, Object> response = new HashMap<>();

        LlmIntent intent = llmService.processUserMessage(message);

        // ===== XỬ LÝ ĐƠN HÀNG =====
        if (Boolean.TRUE.equals(intent.getOrderQuery())) {
            return handleOrderQuery(message, userId, intent);
        }

        // ===== KIỂM TRA SẢN PHẨM =====
        if (!Boolean.TRUE.equals(intent.getProductQuery())) {
            // Không liên quan nội thất → trả lời hướng dẫn
            response.put("reply", intent.getReply() != null
                    ? intent.getReply()
                    : "Xin chào! Mình chuyên hỗ trợ các sản phẩm nội thất như bàn, ghế, sofa, tủ,... Bạn cần tìm sản phẩm gì ạ?");
            return response;
        }

        // ===== XỬ LÝ SẢN PHẨM VỚI SQL TỪ GEMINI =====
        try {
            String sql = intent.getSql();

            if (sql != null && !sql.isEmpty() && !sql.contains("1=0")) {

                if (!isSafeSql(sql)) {
                    response.put("reply", "Xin lỗi, tôi không thể thực hiện truy vấn này.");
                    return response;
                }

                List<Product> products = executeSqlQuery(sql);

                if (!products.isEmpty()) {
                    // Dùng replyIntro từ Gemini
                    response.put("reply", intent.getReplyIntro() != null
                            ? intent.getReplyIntro()
                            : "Dưới đây là các sản phẩm phù hợp:");
                    response.put("products", convertProducts(products));

                    // Dùng summary đã được Gemini tạo sẵn
                    if (intent.getSummary() != null && !intent.getSummary().isEmpty()) {
                        response.put("summary", intent.getSummary());
                    } else {
                        // Fallback: tự tạo summary đơn giản
                        response.put("summary", String.format("Tìm thấy %d sản phẩm phù hợp.", products.size()));
                    }

                } else {
                    response.put("reply", "Rất tiếc, hiện tại chúng mình chưa có sản phẩm phù hợp với yêu cầu '" + message + "'. Bạn có thể tham khảo các sản phẩm nội thất khác như bàn, ghế, sofa, tủ nhé!");
                }
            } else {
                response.put("reply", intent.getReplyIntro() != null
                        ? intent.getReplyIntro()
                        : "Xin lỗi, tôi chưa tìm thấy sản phẩm phù hợp.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("reply", "Xin lỗi, tôi gặp chút vấn đề. Bạn có thể hỏi lại được không ạ?");
        }

        return response;
    }

    // =====================================================
    // 2. XỬ LÝ ĐƠN HÀNG (GIỮ NGUYÊN)
    // =====================================================
    private Map<String, Object> handleOrderQuery(String message, int userId, LlmIntent intent) {
        Map<String, Object> response = new HashMap<>();

        if (Boolean.TRUE.equals(intent.getOrderQuery())) {
            // Đang giao
            if ("shipping".equals(intent.getOrderStatus())) {
                List<Order> orders = orderRepo.findByUserIdAndStatus(userId, "Đang giao");
                response.put("reply", orders.isEmpty()
                        ? "Bạn không có đơn hàng nào đang giao."
                        : intent.getReply() != null ? intent.getReply() : "Đây là các đơn hàng đang giao:");
                response.put("orders", convertOrders(orders));
                return response;
            }

            // Đang xử lý
            if ("processing".equals(intent.getOrderStatus())) {
                List<Order> orders = orderRepo.findByUserIdAndStatus(userId, "Đang xử lý");
                response.put("reply", orders.isEmpty()
                        ? "Bạn không có đơn hàng nào đang xử lý."
                        : intent.getReply() != null ? intent.getReply() : "Đây là các đơn hàng đang xử lý:");
                response.put("orders", convertOrders(orders));
                return response;
            }

            // Đã giao
            if ("completed".equals(intent.getOrderStatus())) {
                List<Order> orders = orderRepo.findByUserIdAndStatus(userId, "Đã giao");
                response.put("reply", orders.isEmpty()
                        ? "Bạn chưa có đơn hàng nào đã giao."
                        : intent.getReply() != null ? intent.getReply() : "Đây là các đơn hàng đã giao:");
                response.put("orders", convertOrders(orders));
                return response;
            }

            // Theo ngày
            if (intent.getDate() != null) {
                try {
                    LocalDate date = parseFlexibleDate(intent.getDate());
                    List<Order> orders = orderRepo.findByUserIdAndDate(userId, date);
                    response.put("reply", orders.isEmpty()
                            ? "Không tìm thấy đơn hàng vào ngày " + intent.getDate()
                            : intent.getReply() != null ? intent.getReply() : "Đây là đơn hàng ngày " + intent.getDate());
                    response.put("orders", convertOrders(orders));
                    return response;
                } catch (Exception e) {
                    response.put("reply", "Ngày bạn nhập chưa đúng định dạng. Ví dụ: 12/12/2025");
                    return response;
                }
            }
        }

        // Mặc định: trả tất cả đơn hàng
        List<Order> orders = orderRepo.findByUserIdAndStatusIn(
                userId, List.of("Đang xử lý", "Đang giao", "Đã giao"));
        response.put("reply", orders.isEmpty()
                ? "Hiện bạn không có đơn hàng nào."
                : "Dưới đây là các đơn hàng của bạn:");
        response.put("orders", convertOrders(orders));

        return response;
    }

    // =====================================================
    // 3. VALIDATE SQL AN TOÀN
    // =====================================================
    private boolean isSafeSql(String sql) {
        String sqlLower = sql.toLowerCase();
        if (!sqlLower.trim().startsWith("select")) {
            return false;
        }

        List<String> dangerous = Arrays.asList(
                "drop", "delete", "update", "insert", "alter",
                "create", "truncate", "exec", "execute", "grant", "revoke"
        );

        for (String keyword : dangerous) {
            if (sqlLower.contains(keyword)) {
                return false;
            }
        }
        return true;
    }

    // =====================================================
    // 4. THỰC THI SQL
    // =====================================================
    private List<Product> executeSqlQuery(String sql) {
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Product product = new Product();
            product.setId(rs.getInt("id"));
            product.setName(rs.getString("name"));
            product.setPrice(rs.getDouble("price"));
            product.setQuantity(rs.getInt("quantity"));
            product.setQuantitySold(rs.getInt("quantity_sold"));
            product.setDiscount(rs.getInt("discount"));
            product.setDescription(rs.getString("description"));
            product.setImg(rs.getString("img"));

            try {
                if (hasColumn(rs, "category_name")) {
                    Category category = new Category();
                    category.setCategoryName(rs.getString("category_name"));
                    product.setCategory(category);
                }
            } catch (Exception e) {}

            return product;
        });
    }

    // =====================================================
    // 5. CONVERT PRODUCT -> MAP
    // =====================================================
    private List<Map<String, Object>> convertProducts(List<Product> products) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Product p : products) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", p.getId());
            item.put("name", p.getName());
            item.put("price", p.getPrice());
            item.put("priceFormatted", String.format("%,.0fđ", p.getPrice()));
            item.put("quantity", p.getQuantity());
            item.put("img", p.getImg());
            item.put("discount", p.getDiscount());
            if (p.getCategory() != null) {
                item.put("categoryName", p.getCategory().getCategoryName());
            }
            result.add(item);
        }
        return result;
    }

    // =====================================================
    // 6. CONVERT ORDER -> MAP
    // =====================================================
    private List<Map<String, Object>> convertOrders(List<Order> orders) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Order o : orders) {
            Map<String, Object> ord = new HashMap<>();
            ord.put("orderId", o.getId());
            ord.put("status", o.getStatus());
            ord.put("total", o.getTotalAmount());
            ord.put("totalFormatted", String.format("%,.0fđ", o.getTotalAmount()));
            ord.put("createdDate", o.getDate() != null ? o.getDate().toString() : "");
            result.add(ord);
        }
        return result;
    }

    // =====================================================
    // 7. PARSE NGÀY
    // =====================================================
    private LocalDate parseFlexibleDate(String input) {
        List<String> patterns = List.of(
                "dd/MM/yyyy",
                "d/M/yyyy",
                "yyyy-MM-dd",
                "dd-MM-yyyy",
                "yyyy/MM/dd"
        );
        for (String pattern : patterns) {
            try {
                return LocalDate.parse(input, DateTimeFormatter.ofPattern(pattern));
            } catch (DateTimeParseException ignored) {}
        }
        throw new RuntimeException("Invalid date format: " + input);
    }

    // =====================================================
    // 8. HELPER
    // =====================================================
    private boolean hasColumn(ResultSet rs, String columnName) {
        try {
            rs.findColumn(columnName);
            return true;
        } catch (SQLException e) {
            return false;
        }
    }
}