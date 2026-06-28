package com.example.demo.service;

import com.example.demo.dto.LlmIntent;
import com.example.demo.dto.QueryResult;
import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.entity.Order;
import com.example.demo.repository.FoodRepository;
import com.example.demo.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    @Autowired
    private ObjectMapper objectMapper;

    // =====================================================
    // 1. MAIN - XỬ LÝ TIN NHẮN (RAG)
    // =====================================================
    public Map<String, Object> getReply(String message, int userId) {
        Map<String, Object> response = new HashMap<>();

        // BƯỚC 1: KIỂM TRA INTENT - Xác định loại câu hỏi
        LlmIntent intent = llmService.extractIntent(message);

        // BƯỚC 2: XỬ LÝ ĐƠN HÀNG
        if (Boolean.TRUE.equals(intent.getOrderQuery())) {
            return handleOrderQuery(message, userId, intent);
        }

        // BƯỚC 3: KIỂM TRA CÂU HỎI CÓ LIÊN QUAN NỘI THẤT KHÔNG
        if (!Boolean.TRUE.equals(intent.getProductQuery())) {
            // Không liên quan nội thất → trả lời hướng dẫn
            response.put("reply", intent.getReply() != null
                    ? intent.getReply()
                    : "Xin chào! Mình chuyên hỗ trợ các sản phẩm nội thất như bàn, ghế, sofa, tủ,... Bạn cần tìm sản phẩm gì ạ?");
            return response;
        }

        // BƯỚC 4: LIÊN QUAN NỘI THẤT → SINH SQL VÀ TRUY XUẤT
        try {
            QueryResult queryResult = llmService.generateQuery(message);

            if (queryResult.getSql() != null && !queryResult.getSql().isEmpty()
                    && !queryResult.getSql().contains("1=0")) {

                if (!isSafeSql(queryResult.getSql())) {
                    response.put("reply", "Xin lỗi, tôi không thể thực hiện truy vấn này.");
                    return response;
                }

                List<Product> products = executeSqlQuery(queryResult.getSql());

                if (!products.isEmpty()) {
                    response.put("reply", queryResult.getReplyIntro());
                    response.put("products", convertProducts(products));

                    String summary = llmService.summarizeProducts(
                            message,
                            products,
                            queryResult.getReplyIntro()
                    );
                    response.put("summary", summary);

                } else {
                    // Không tìm thấy sản phẩm → trả lời tự nhiên
                    response.put("reply", "Rất tiếc, hiện tại chúng mình chưa có sản phẩm phù hợp với yêu cầu '" + message + "'. Bạn có thể tham khảo các sản phẩm nội thất khác như bàn, ghế, sofa, tủ nhé!");
                }
            } else {
                response.put("reply", queryResult.getReplyIntro());
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("reply", "Xin lỗi, tôi gặp chút vấn đề. Bạn có thể hỏi lại được không ạ?");
        }

        return response;
    }

    // =====================================================
    // 2. XỬ LÝ ĐƠN HÀNG
    // =====================================================
    private Map<String, Object> handleOrderQuery(String message, int userId, LlmIntent intent) {
        Map<String, Object> response = new HashMap<>();

        if (Boolean.TRUE.equals(intent.getOrderQuery())) {
            // Đang giao
            if ("shipping".equals(intent.getOrderStatus())) {
                List<Order> orders = orderRepo.findByUserIdAndStatus(userId, "Đang giao");
                response.put("reply", orders.isEmpty()
                        ? "Bạn không có đơn hàng nào đang giao."
                        : intent.getReply());
                response.put("orders", convertOrders(orders));
                return response;
            }

            // Đang xử lý
            if ("processing".equals(intent.getOrderStatus())) {
                List<Order> orders = orderRepo.findByUserIdAndStatus(userId, "Đang xử lý");
                response.put("reply", orders.isEmpty()
                        ? "Bạn không có đơn hàng nào đang xử lý."
                        : intent.getReply());
                response.put("orders", convertOrders(orders));
                return response;
            }

            // Đã giao
            if ("completed".equals(intent.getOrderStatus())) {
                List<Order> orders = orderRepo.findByUserIdAndStatus(userId, "Đã giao");
                response.put("reply", orders.isEmpty()
                        ? "Bạn chưa có đơn hàng nào đã giao."
                        : intent.getReply());
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
                            : intent.getReply());
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
    // 3. KIỂM TRA ĐƠN HÀNG
    // =====================================================
    private boolean isOrderQuery(String message) {
        String lowerMsg = message.toLowerCase();
        return lowerMsg.contains("đơn hàng") ||
                lowerMsg.contains("đặt hàng") ||
                lowerMsg.contains("giao hàng") ||
                lowerMsg.contains("vận chuyển") ||
                lowerMsg.contains("đang giao") ||
                lowerMsg.contains("đã nhận") ||
                lowerMsg.contains("check đơn");
    }

    // =====================================================
    // 4. VALIDATE SQL AN TOÀN
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
    // 5. THỰC THI SQL
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
    // 6. CONVERT PRODUCT -> MAP
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
    // 7. CONVERT ORDER -> MAP
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
    // 8. PARSE NGÀY
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
    // 9. HELPER
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