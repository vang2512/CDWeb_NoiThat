package com.example.demo.service;

import com.example.demo.dto.LlmIntent;
import com.example.demo.dto.QueryResult;
import com.example.demo.dto.VoiceSearchIntent;
import com.example.demo.entity.Product;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class LlmService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    // =====================================================
    // 1. CHAT INTENT (ĐƠN HÀNG / SẢN PHẨM) - GIỮ NGUYÊN
    // =====================================================
    public LlmIntent extractIntent(String userMessage) {
        String prompt = """
            Bạn là nhân viên CSKH của WEBSITE BÁN NỘI THẤT (bàn, ghế, sofa, tủ, giường, kệ, nội thất phòng khách, phòng ngủ,...).
            
            NHIỆM VỤ:
            - Phân tích câu hỏi của khách hàng
            - Xác định có liên quan đến nội thất hay đơn hàng không
            - Nếu không liên quan → trả lời lịch sự, thân thiện và hướng khách hàng về sản phẩm nội thất
            
            === QUY TẮC ===
            1. Nếu câu hỏi KHÔNG LIÊN QUAN đến nội thất (đồ ăn, đồ uống, thời tiết, game, phim ảnh, thể thao,...):
               - productQuery = false
               - reply = câu trả lời lịch sự, vui vẻ + giới thiệu sản phẩm nội thất
            
            2. Nếu liên quan đến sản phẩm nội thất:
               - productQuery = true
               - reply = câu trả lời ngắn gọn về sản phẩm
            
            3. Nếu liên quan đến đơn hàng:
               - orderQuery = true
               - reply = câu trả lời về đơn hàng
            
            === VÍ DỤ CÂU TRẢ LỜI KHI KHÔNG LIÊN QUAN ===
            - "Bên bạn có bán nước mía không?"
            → "Dạ, bên em chuyên về nội thất ạ! Em có thể tư vấn cho anh/chị các sản phẩm như bàn, ghế, sofa, tủ... Anh/chị cần tìm sản phẩm gì ạ? 😊"
            
            - "Hôm nay thời tiết thế nào?"
            → "Chào anh/chị! Bên em không cập nhật thời tiết, nhưng em có thể giới thiệu các mẫu sofa mới nhất, rất thoải mái để ngồi thư giãn trong mọi thời tiết luôn ạ! Anh/chị quan tâm không ạ?"
            
            - "Bánh pizza có không?"
            → "Dạ, bên em bán nội thất chứ không bán đồ ăn ạ 😄 Nhưng em có thể tư vấn các mẫu bàn ăn, bàn trà, ghế ăn rất đẹp cho không gian bếp của anh/chị ạ!"
            
            - "Cho em hỏi giá xe máy"
            → "Dạ, bên em không kinh doanh xe máy ạ. Nhưng bên em có các mẫu ghế sofa, bàn ghế nội thất rất chất lượng. Anh/chị có muốn tham khảo không ạ?"
            
            - "Có bán đồ điện tử không?"
            → "Dạ, bên em chuyên về nội thất thôi ạ. Nếu anh/chị cần tìm bàn làm việc, ghế văn phòng hay kệ sách thì bên em có sẵn nhé!"
            
            === JSON ===
            {
              "orderQuery": true | false,
              "productQuery": true | false,
              "productType": "top_selling" | "top_rated" | "highest_price" | null,
              "orderStatus": "processing" | "shipping" | "completed" | null,
              "date": "yyyy-MM-dd" | null,
              "reply": "câu trả lời tiếng Việt tự nhiên, thân thiện"
            }
            
            Câu người dùng:
            "%s"
            """.formatted(userMessage);

        return callGeminiForJson(prompt, LlmIntent.class, getChatFallback());
    }

    // =====================================================
    // 2. GENERATE SQL QUERY - CHÍNH (TRẢ VỀ QUERYRESULT)
    // =====================================================
// =====================================================
// 2. GENERATE SQL QUERY - CHÍNH (TRẢ VỀ QUERYRESULT)
// =====================================================
    public QueryResult generateQuery(String userMessage) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Bạn là chuyên gia SQL MySQL, chuyển câu hỏi tiếng Việt thành SQL.\n\n");

        prompt.append("=== CẤU TRÚC BẢNG ===\n");
        prompt.append("- products: id, name, price, quantity, quantity_sold, discount, description, img, created_at, categoryid\n");
        prompt.append("- product_specifications: id, material, origin, standard, dimensions, product_id\n");
        prompt.append("- categories: id, category_name\n\n");

        prompt.append("=== QUAN HỆ ===\n");
        prompt.append("- products.categoryid = categories.id\n");
        prompt.append("- product_specifications.product_id = products.id\n\n");

        prompt.append("=== QUY TẮC ===\n");
        prompt.append("1. CHỈ SELECT, không UPDATE/DELETE/INSERT/DROP\n");
        prompt.append("2. Giới hạn LIMIT 5\n");
        prompt.append("3. LIKE phải có % ở 2 đầu: LIKE '%từ khóa%'\n");
        prompt.append("4. Trả về JSON: {\"sql\": \"...\", \"replyIntro\": \"...\"}\n\n");

        prompt.append("=== CHUYỂN ĐỔI ===\n");
        prompt.append("- \"bán chạy nhất\" → ORDER BY quantity_sold DESC LIMIT 1\n");
        prompt.append("- \"giá dưới X\" → price < X\n");
        prompt.append("- \"giá từ X-Y\" → price BETWEEN X AND Y\n");
        prompt.append("- \"còn hàng không\" → quantity > 0\n");
        prompt.append("- \"mới nhất\" → ORDER BY created_at DESC\n");
        prompt.append("- \"ghế sofa\" → name LIKE '%ghế%' OR name LIKE '%sofa%'\n");
        prompt.append("- \"chất liệu da\" → s.material LIKE '%da%'\n");
        prompt.append("- \"phòng khách\" → c.category_name LIKE '%phòng khách%'\n\n");

        prompt.append("=== VÍ DỤ ===\n");
        prompt.append("User: \"sofa da giá dưới 5 triệu\"\n");
        prompt.append("→ {\"sql\": \"SELECT p.* FROM products p JOIN product_specifications s ON p.id = s.product_id WHERE (p.name LIKE '%sofa%' OR p.name LIKE '%ghế%') AND s.material LIKE '%da%' AND p.price < 5000000 LIMIT 5\", \"replyIntro\": \"Dạ, em tìm được các sản phẩm sofa da dưới 5 triệu đây ạ:\"}\n\n");

        prompt.append("User: \"còn bàn gỗ nào không\"\n");
        prompt.append("→ {\"sql\": \"SELECT p.* FROM products p JOIN product_specifications s ON p.id = s.product_id WHERE p.name LIKE '%bàn%' AND s.material LIKE '%gỗ%' AND p.quantity > 0 LIMIT 5\", \"replyIntro\": \"Các sản phẩm bàn gỗ còn hàng:\"}\n\n");

        prompt.append("User: \"sản phẩm mới nhất\"\n");
        prompt.append("→ {\"sql\": \"SELECT * FROM products ORDER BY created_at DESC LIMIT 5\", \"replyIntro\": \"Những sản phẩm mới nhất của chúng mình:\"}\n\n");

        prompt.append("User: \"ghế ăn giá từ 2-5 triệu\"\n");
        prompt.append("→ {\"sql\": \"SELECT * FROM products WHERE name LIKE '%ghế%' AND price BETWEEN 2000000 AND 5000000 LIMIT 5\", \"replyIntro\": \"Các ghế ăn trong tầm giá 2-5 triệu:\"}\n\n");

        prompt.append("User: \"nội thất phòng khách\"\n");
        prompt.append("→ {\"sql\": \"SELECT p.* FROM products p JOIN categories c ON p.categoryid = c.id WHERE c.category_name LIKE '%phòng khách%' LIMIT 5\", \"replyIntro\": \"Sản phẩm nội thất phòng khách:\"}\n\n");

        prompt.append("User: \"tủ quần áo gỗ óc chó\"\n");
        prompt.append("→ {\"sql\": \"SELECT p.* FROM products p JOIN product_specifications s ON p.id = s.product_id WHERE p.name LIKE '%tủ%' AND s.material LIKE '%gỗ óc chó%' LIMIT 5\", \"replyIntro\": \"Tủ quần áo gỗ óc chó:\"}\n\n");

        prompt.append("Câu người dùng: \"").append(userMessage).append("\"");

        return callGeminiForJson(prompt.toString(), QueryResult.class, getFallbackQueryResult());
    }

    // =====================================================
    // 3. SUMMARIZE PRODUCTS - TỔNG HỢP KẾT QUẢ
    // =====================================================
    public String summarizeProducts(String userQuestion, List<Product> products, String intro) {
        if (products == null || products.isEmpty()) {
            return "Hiện tại chưa có sản phẩm phù hợp với yêu cầu của bạn.";
        }

        StringBuilder productInfo = new StringBuilder();
        for (int i = 0; i < Math.min(products.size(), 5); i++) {
            Product p = products.get(i);
            productInfo.append(String.format(
                    "%d. %s - %.0fđ (còn %d sản phẩm)%n",
                    i + 1, p.getName(), p.getPrice(), p.getQuantity()
            ));
        }

        String prompt = String.format("""
        Bạn là nhân viên tư vấn nội thất chuyên nghiệp, thân thiện.
        
        KHÁCH HÀNG HỎI: "%s"
        
        DANH SÁCH SẢN PHẨM TÌM ĐƯỢC:
        %s
        
        YÊU CẦU:
        1. Viết câu trả lời tự nhiên, ấm áp, ngắn gọn (2-3 câu)
        2. Giới thiệu sản phẩm nổi bật nhất (sản phẩm đầu tiên)
        3. Nhấn mạnh đặc điểm nổi bật (giá, chất liệu, tình trạng)
        4. CHỈ TRẢ VỀ TEXT THUẦN, KHÔNG JSON, KHÔNG MARKDOWN
        5. Kết thúc bằng lời mời xem thêm hoặc hỏi thêm
        
        VÍ DỤ: "Dạ, em thấy có Ghế Sofa ABC giá 5.000.000đ, chất liệu da cao cấp, đang còn 10 sản phẩm ạ. Sản phẩm này đang được nhiều khách hàng yêu thích. Anh/chị muốn xem thêm thông tin chi tiết không ạ?"
        """, userQuestion, productInfo.toString());

        return callGeminiForText(prompt, "Em thấy có các sản phẩm này phù hợp với nhu cầu của anh/chị ạ!");
    }

    // =====================================================
    // 4. GEMINI CALL CHO JSON
    // =====================================================
    private <T> T callGeminiForJson(String prompt, Class<T> clazz, T fallback) {
        try {
            String rawText = callGeminiApi(prompt);
            System.out.println("GEMINI JSON RAW: " + rawText);

            String json = extractJson(rawText);
            System.out.println("GEMINI JSON EXTRACTED: " + json);

            return mapper.readValue(json, clazz);
        } catch (Exception e) {
            System.err.println("Lỗi callGeminiForJson: " + e.getMessage());
            e.printStackTrace();
            return fallback;
        }
    }

    // =====================================================
    // 5. GEMINI CALL CHO TEXT
    // =====================================================
    private String callGeminiForText(String prompt, String fallback) {
        try {
            String rawText = callGeminiApi(prompt);
            System.out.println("GEMINI TEXT RAW: " + rawText);

            // Xóa markdown nếu có
            String cleanText = rawText.trim();
            if (cleanText.startsWith("```json")) {
                cleanText = cleanText.substring(7);
            }
            if (cleanText.startsWith("```")) {
                cleanText = cleanText.substring(3);
            }
            if (cleanText.endsWith("```")) {
                cleanText = cleanText.substring(0, cleanText.length() - 3);
            }

            return cleanText.trim();
        } catch (Exception e) {
            System.err.println("Lỗi callGeminiForText: " + e.getMessage());
            e.printStackTrace();
            return fallback;
        }
    }

    // =====================================================
    // 6. GỌI GEMINI API
    // =====================================================
    private String callGeminiApi(String prompt) throws Exception {
        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<?> request = new HttpEntity<>(body, headers);
        String url = apiUrl + "?key=" + apiKey;

        ResponseEntity<String> res = restTemplate.postForEntity(url, request, String.class);

        JsonNode root = mapper.readTree(res.getBody());
        String text = root
                .path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text")
                .asText();

        if (text == null || text.isEmpty()) {
            throw new RuntimeException("Gemini trả về response rỗng");
        }

        return text;
    }

    // =====================================================
    // 7. EXTRACT JSON
    // =====================================================
    private String extractJson(String raw) {
        String cleaned = raw.trim();

        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        }
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        cleaned = cleaned.trim();

        int start = cleaned.indexOf("{");
        int end = cleaned.lastIndexOf("}");

        if (start >= 0 && end > start) {
            return cleaned.substring(start, end + 1);
        }

        throw new RuntimeException("Không tìm thấy JSON từ Gemini: " + raw);
    }

    // =====================================================
    // 8. FALLBACK
    // =====================================================
    private LlmIntent getChatFallback() {
        LlmIntent f = new LlmIntent();
        f.setOrderQuery(false);
        f.setProductQuery(false);
        f.setReply("Mình chưa hiểu rõ câu hỏi, bạn nói lại giúp mình nhé.");
        return f;
    }

    private QueryResult getFallbackQueryResult() {
        QueryResult f = new QueryResult();
        f.setSql("");
        f.setReplyIntro("Xin lỗi, tôi chưa hiểu rõ câu hỏi. Bạn có thể hỏi về sản phẩm nội thất được không?");
        return f;
    }
}