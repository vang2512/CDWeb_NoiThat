package com.example.demo.service;

import com.example.demo.dto.LlmIntent;
import com.example.demo.dto.QueryResult;
import com.example.demo.model.Product;
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

    // 1. MAIN - XỬ LÝ TOÀN BỘ TIN NHẮN (CHỈ GỌI 1 LẦN)
    public LlmIntent processUserMessage(String userMessage) {
        String prompt = buildUnifiedPrompt(userMessage);
        return callGeminiForJson(prompt, LlmIntent.class, getFallbackIntent());
    }
    private String buildUnifiedPrompt(String userMessage) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("""
        Bạn là trợ lý AI của WEBSITE BÁN NỘI THẤT (bàn, ghế, sofa, tủ, giường, kệ, nội thất phòng khách, phòng ngủ,...).
        
        === QUY TẮC TÌM KIẾM QUAN TRỌNG ===
        ⚠️ TÌM CẢ "Tủ" (viết hoa) VÀ "tủ" (viết thường) ⚠️
        
        Database lưu sản phẩm với cả chữ hoa và chữ thường:
        - "Tủ Đầu Giường..." (viết hoa T)
        - "tủ quần áo..." (viết thường t)
        
        SQL LIKE không phân biệt hoa/thường nên:
        - name LIKE '%tủ%' sẽ tìm được cả "Tủ" và "tủ"
        
        KHÔNG tìm "tu" (không dấu) vì sẽ lấy nhầm "Signature" 
        
        === CÂU HỎI ===
        """);
        prompt.append(userMessage);
        prompt.append("""
        
        === NHIỆM VỤ ===
        Phân tích và trả về JSON với đầy đủ các trường sau.
        
        === QUY TẮC QUAN TRỌNG NHẤT ===
        ⚠️ PHẢI GIỮ ĐÚNG TỪ KHÓA SẢN PHẨM TRONG SQL ⚠️
        - Nếu user hỏi "tủ", "từ", "tũ", "tụ" → SQL PHẢI có: WHERE name LIKE '%tủ%' AND quantity > 0
        - Nếu user hỏi "ghế", "ghê", "ghể" → SQL PHẢI có: WHERE name LIKE '%ghế%' AND quantity > 0
        - Nếu user hỏi "bàn" → SQL PHẢI có: WHERE name LIKE '%bàn%' AND quantity > 0
        - Nếu user hỏi "sofa" → SQL PHẢI có: WHERE name LIKE '%sofa%' AND quantity > 0
        - KHÔNG ĐƯỢC thay đổi từ khóa sang sản phẩm khác
        - KHÔNG ĐƯỢC tìm không dấu (sẽ lấy nhầm sản phẩm)
        - ⚠️ LUÔN LUÔN THÊM ĐIỀU KIỆN quantity > 0 (chỉ hiển thị sản phẩm còn hàng)
        
        === PHẦN 1: PHÂN LOẠI INTENT ===
        
        1. **productQuery** (boolean):
           - true nếu hỏi về sản phẩm nội thất (bàn, ghế, sofa, tủ, giường, kệ, đèn,...)
           - false nếu không liên quan nội thất
        
        2. **orderQuery** (boolean):
           - true nếu hỏi về đơn hàng (đặt hàng, giao hàng, vận chuyển, đang giao, đã nhận, check đơn)
           - false nếu không
        
        3. **reply** (string):
           - Nếu KHÔNG liên quan nội thất và KHÔNG liên quan đơn hàng:
             Trả lời lịch sự, thân thiện, tự nhiên, hướng khách hàng về sản phẩm nội thất
        
        === PHẦN 2: XỬ LÝ ĐƠN HÀNG (khi orderQuery=true) ===
        
        4. **orderStatus** (string): "shipping" | "processing" | "completed" | null
        5. **date** (string): ngày trong câu hỏi (định dạng yyyy-MM-dd) | null
        
        === PHẦN 3: XỬ LÝ SẢN PHẨM (khi productQuery=true) ===
        
        6. **sql** (string): Câu SQL SELECT từ bảng products
           - ⚠️ PHẢI TRÍCH XUẤT ĐÚNG TỪ KHÓA TỪ CÂU HỎI ⚠️
           - CHỈ TÌM TỪ CÓ DẤU, KHÔNG TÌM KHÔNG DẤU:
             * "từ" → "%tủ%" (tìm cả "Tủ" và "tủ")
             * "tũ" → "%tủ%" (tìm cả "Tủ" và "tủ")
             * "tụ" → "%tủ%" (tìm cả "Tủ" và "tủ")
             * "ghê" → "%ghế%" (tìm cả "Ghế" và "ghế")
             * "ghể" → "%ghế%" (tìm cả "Ghế" và "ghế")
           
           - ⚠️ BẮT BUỘC THÊM: AND quantity > 0 (chỉ lấy sản phẩm còn hàng)
           
           - QUY TẮC VỀ LIMIT:
             * Nếu người dùng yêu cầu số lượng cụ thể → LIMIT đúng số lượng đó
             * Nếu không yêu cầu số lượng → LIMIT 5 (mặc định)
           
           - CHỈ dùng SELECT, WHERE, ORDER BY, LIMIT
           - KHÔNG dùng DELETE, UPDATE, INSERT, DROP
           - Ưu tiên quantity_sold DESC cho sản phẩm bán chạy
           - Có thể JOIN với bảng product_specifications để lọc theo chất liệu, kích thước
        
        7. **replyIntro** (string): Câu giới thiệu kết quả TỰ NHIÊN, THÂN THIỆT
           - Ví dụ: "Dạ, em xin giới thiệu 5 mẫu tủ đẹp nhất đang có sẵn tại shop ạ:"
           - Ví dụ: "Vâng, hiện shop có 5 mẫu ghế ăn rất xinh, em gửi chị tham khảo nhé:"
           - PHẢI bao gồm số lượng sản phẩm trong câu giới thiệu
           - Sử dụng ngôn ngữ tự nhiên, đa dạng, không lặp lại
        
        8. **summary** (string): Tóm tắt ngắn gọn về kết quả (1-2 câu)
           - Nêu số lượng, khoảng giá, đặc điểm nổi bật
           - Ví dụ: "Các sản phẩm này có giá từ 2-5 triệu, chất liệu gỗ tự nhiên, thiết kế hiện đại."
        
        === CẤU TRÚC BẢNG ===
        - products: id, name, price, quantity, quantity_sold, discount, description, img, created_at, categoryid
        - product_specifications: id, material, origin, standard, dimensions, product_id
        - categories: id, category_name
        
        === QUAN HỆ ===
        - products.categoryid = categories.id
        - product_specifications.product_id = products.id
        
        === QUY TẮC SQL CHI TIẾT ===
        1. "bán chạy nhất" → ORDER BY quantity_sold DESC LIMIT 1
        2. "giá dưới X" → price < X
        3. "giá từ X-Y" → price BETWEEN X AND Y
        4. "còn hàng không" → quantity > 0
        5. "mới nhất" → ORDER BY created_at DESC
        6. Tìm đúng từ khóa sản phẩm (CHỈ TÌM CÓ DẤU, tìm được cả hoa và thường):
           - User hỏi "sofa" → name LIKE '%sofa%' (tìm "Sofa" và "sofa")
           - User hỏi "ghế", "ghê", "ghể" → name LIKE '%ghế%' (tìm "Ghế" và "ghế")
           - User hỏi "bàn" → name LIKE '%bàn%' (tìm "Bàn" và "bàn")
           - User hỏi "tủ", "từ", "tũ", "tụ" → name LIKE '%tủ%' (tìm "Tủ" và "tủ")
           - User hỏi "giường" → name LIKE '%giường%' (tìm "Giường" và "giường")
           - User hỏi "kệ" → name LIKE '%kệ%' (tìm "Kệ" và "kệ")
        7. KHI NGƯỜI DÙNG HỎI VỀ 'SOFA':
           - Ưu tiên tìm sản phẩm có tên chứa 'sofa'
           - KHÔNG gộp chung 'sofa' và 'ghế' trong 1 câu lệnh LIKE
        8. ⚠️ LUÔN THÊM quantity > 0 vào WHERE để chỉ hiển thị sản phẩm còn hàng
        
        === VÍ DỤ ===
        
        **Ví dụ 1: Hỏi tủ (tìm cả "Tủ" và "tủ")**
        User: "Bên bạn có bán tủ không ?"
        → {
          "productQuery": true,
          "orderQuery": false,
          "sql": "SELECT * FROM products WHERE name LIKE '%tủ%' AND quantity > 0 LIMIT 5",
          "replyIntro": "Dạ có ạ! Em xin giới thiệu 5 mẫu tủ đang có sẵn tại shop:",
          "summary": "Các mẫu tủ đa dạng kiểu dáng, chất liệu gỗ cao cấp, giá từ 3-10 triệu.",
          "reply": null
        }
        
        **Ví dụ 2: Hỏi tủ 4 cái (tìm cả "Tủ" và "tủ")**
        User: "cho tôi 4 cái tủ giá vừa phải"
        → {
          "productQuery": true,
          "orderQuery": false,
          "sql": "SELECT * FROM products WHERE name LIKE '%tủ%' AND quantity > 0 ORDER BY price ASC LIMIT 4",
          "replyIntro": "Vâng, em đã tìm được 4 mẫu tủ giá vừa phải cho chị đây ạ:",
          "summary": "Các mẫu tủ có giá từ 2-4 triệu, thiết kế đơn giản mà sang trọng.",
          "reply": null
        }
        
        **Ví dụ 3: Hỏi ghế (tìm cả "Ghế" và "ghế")**
        User: "có ghế ăn không"
        → {
          "productQuery": true,
          "orderQuery": false,
          "sql": "SELECT * FROM products WHERE name LIKE '%ghế ăn%' AND quantity > 0 LIMIT 5",
          "replyIntro": "Dạ, shop em có ghế ăn nè! Đây là 5 mẫu đẹp nhất ạ:",
          "summary": "5 mẫu ghế ăn đa dạng từ gỗ tự nhiên đến kim loại, giá từ 500k-2 triệu.",
          "reply": null
        }
        
        **Ví dụ 4: Hỏi sofa (tìm cả "Sofa" và "sofa")**
        User: "sofa da giá dưới 5 triệu"
        → {
          "productQuery": true,
          "orderQuery": false,
          "sql": "SELECT p.* FROM products p JOIN product_specifications s ON p.id = s.product_id WHERE p.name LIKE '%sofa%' AND s.material LIKE '%da%' AND p.price < 5000000 AND p.quantity > 0 LIMIT 5",
          "replyIntro": "Dạ, em có 5 mẫu sofa da dưới 5 triệu siêu đẹp ạ:",
          "summary": "Sofa da cao cấp, khung gỗ chắc chắn, giá từ 3-5 triệu, bảo hành 12 tháng.",
          "reply": null
        }
        
        **Ví dụ 5: Không liên quan (trả lời tự nhiên)**
        User: "Hôm nay thời tiết thế nào?"
        → {
          "productQuery": false,
          "orderQuery": false,
          "orderStatus": null,
          "date": null,
          "sql": null,
          "replyIntro": null,
          "summary": null,
          "reply": "Dạ, em là trợ lý của cửa hàng nội thất ạ. Không biết hôm nay chị có nhu cầu mua sắm nội thất gì cho nhà mình không? Shop em có rất nhiều mẫu bàn ghế, sofa, tủ,... đang sale ạ!"
        }
        
        === TỪ KHÓA CHỈ SỐ LƯỢNG ===
        - "3 cái", "5 sản phẩm", "10 món", "2 bộ" → Lấy số lượng cụ thể
        - "vài", "một vài", "ít", "vài cái" → LIMIT 5
        - "nhiều", "tất cả", "toàn bộ", "hàng loạt" → LIMIT 10
        - "1", "một", "duy nhất" → LIMIT 1
        - Không có từ chỉ số lượng → LIMIT 5 (mặc định)
        
        === CÁCH TRẢ LỜI TỰ NHIÊN ===
        Khi trả lời, hãy:
        - Xưng hô: "em" (với khách hàng là "anh/chị")
        - Sử dụng ngôn ngữ thân thiện, gần gũi
        - Có thể thêm các từ cảm thán: "ạ", "nè", "nhé"
        - Giới thiệu sản phẩm một cách hấp dẫn, nhấn mạnh ưu điểm
        - Không trả lời quá dài dòng, tập trung vào thông tin hữu ích
        
        === YÊU CẦU ĐẶC BIỆT ===
        - CHỈ trả về JSON, KHÔNG thêm gì khác
        - JSON phải hợp lệ, không thiếu dấu ngoặc
        - LUÔN có LIMIT trong SQL và quantity > 0
        
        === ĐỊNH DẠNG JSON TRẢ VỀ ===
        {
          "productQuery": boolean,
          "orderQuery": boolean,
          "orderStatus": "shipping|processing|completed|null",
          "date": "yyyy-MM-dd|null",
          "sql": "string|null",
          "replyIntro": "string|null",
          "summary": "string|null",
          "reply": "string|null"
        }
        
        CHỈ TRẢ VỀ JSON HỢP LỆ, KHÔNG GIẢI THÍCH GÌ THÊM!
        """);

        return prompt.toString();
    }
    // 3. CÁC PHƯƠNG THỨC CŨ (GIỮ LẠI ĐỂ COMPATIBLE)
    @Deprecated
    public LlmIntent extractIntent(String userMessage) {
        // Chuyển sang dùng processUserMessage
        return processUserMessage(userMessage);
    }

    @Deprecated
    public QueryResult generateQuery(String userMessage) {
        // Fallback: trả về QueryResult từ intent
        LlmIntent intent = processUserMessage(userMessage);
        QueryResult result = new QueryResult();
        result.setSql(intent.getSql());
        result.setReplyIntro(intent.getReplyIntro());
        return result;
    }

    @Deprecated
    public String summarizeProducts(String userQuestion, List<Product> products, String intro) {
        // Fallback: tạo summary đơn giản
        if (products == null || products.isEmpty()) {
            return "Hiện tại chưa có sản phẩm phù hợp với yêu cầu của bạn.";
        }
        return String.format("Tìm thấy %d sản phẩm phù hợp với nhu cầu của anh/chị ạ!", products.size());
    }

    // =====================================================
    // 4. GEMINI CALL CHO JSON
    // =====================================================
    private <T> T callGeminiForJson(String prompt, Class<T> clazz, T fallback) {
        try {
            String rawText = callGeminiApi(prompt);
            System.out.println("=== GEMINI RESPONSE ===");
            System.out.println(rawText);

            String json = extractJson(rawText);
            System.out.println("=== EXTRACTED JSON ===");
            System.out.println(json);

            return mapper.readValue(json, clazz);
        } catch (Exception e) {
            System.err.println("Lỗi callGeminiForJson: " + e.getMessage());
            e.printStackTrace();
            return fallback;
        }
    }

    // =====================================================
    // 5. GỌI GEMINI API
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
    // 6. EXTRACT JSON
    // =====================================================
    private String extractJson(String raw) {
        String cleaned = raw.trim();

        // Xóa markdown
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

        // Tìm JSON object
        int start = cleaned.indexOf("{");
        int end = cleaned.lastIndexOf("}");

        if (start >= 0 && end > start) {
            return cleaned.substring(start, end + 1);
        }

        throw new RuntimeException("Không tìm thấy JSON từ Gemini: " + raw);
    }

    // =====================================================
    // 7. FALLBACK
    // =====================================================
    private LlmIntent getFallbackIntent() {
        LlmIntent f = new LlmIntent();
        f.setOrderQuery(false);
        f.setProductQuery(false);
        f.setReply("Xin lỗi, tôi chưa hiểu rõ câu hỏi. Bạn có thể hỏi lại về sản phẩm nội thất hoặc đơn hàng được không ạ?");
        return f;
    }
}