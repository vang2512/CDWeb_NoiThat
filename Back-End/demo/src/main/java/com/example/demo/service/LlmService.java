package com.example.demo.service;

import com.example.demo.dto.LlmIntent;
import com.example.demo.dto.VoiceSearchIntent;
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
    // CHAT INTENT (ĐƠN HÀNG / SẢN PHẨM)
    // =====================================================
    public LlmIntent extractIntent(String userMessage) {

        String prompt = """
                Bạn là chatbot cho WEBSITE BÁN NỘI THẤT (bàn, ghế, sofa, tủ,...)
                
                NHIỆM VỤ:
                - Tư vấn sản phẩm nội thất
                - Trả lời đơn hàng
                - Hỗ trợ khách hàng
                
                === QUY TẮC ===
                1. Nếu câu hỏi KHÔNG LIÊN QUAN đến nội thất → 
                   trả lời lịch sự + hướng user về sản phẩm
                
                2. Nếu liên quan sản phẩm → productQuery = true
                3. Nếu liên quan đơn hàng → orderQuery = true
                
                === STYLE TRẢ LỜI ===
                - Ngắn gọn
                - Thân thiện
                - Giống nhân viên CSKH
                
                === JSON ===
                {
                  "orderQuery": true | false,
                  "productQuery": true | false,
                  "productType": "top_selling" | "top_rated" | "highest_price" | null,
                  "orderStatus": "processing" | "shipping" | "completed" | null,
                  "date": "yyyy-MM-dd" | null,
                  "reply": "câu trả lời tiếng Việt tự nhiên"
                }
                
                === VÍ DỤ ===
                User: "thời tiết hôm nay sao"
                → reply: "Mình chuyên hỗ trợ nội thất thôi 😄 bạn cần tìm sofa hay bàn ghế không?"
                
                User: "sofa nào bán chạy"
                → productQuery = true
                
                Câu người dùng:
                "%s"
                """.formatted(userMessage);

        return callGemini(prompt, LlmIntent.class, getChatFallback());
    }

    // =====================================================
    // VOICE SEARCH (TÌM KIẾM MÓN ĂN)
    // =====================================================
    public VoiceSearchIntent extractVoiceSearch(String userMessage) {

        String prompt = """
                Bạn là AI cho app đặt đồ ăn Việt Nam.
                Nhiệm vụ: phân tích câu nói GIỌNG NÓI để tìm món ăn.
                
                CHỈ TRẢ VỀ JSON HỢP LỆ.
                KHÔNG markdown.
                KHÔNG giải thích.
                
                === QUY TẮC ===
                - Có tìm món → searchFood = true
                - Không rõ → searchFood = false
                
                === TÊN MÓN ===
                Nếu nói rõ tên → foodName
                Không có → null
                
                === DANH MỤC ===
                Ví dụ: đồ uống, món chay, gà, hải sản, cơm, mì
                Không có → null
                
                === GIÁ ===
                - "rẻ nhất" → cheapest
                - "đắt nhất" → most_expensive
                - "dưới 50 nghìn" → maxPrice = 50000
                - "trên 30 nghìn" → minPrice = 30000
                - "từ 30 tới 60 nghìn" → minPrice=30000, maxPrice=60000
                
                === GỢI Ý ===
                - "gợi ý", "ngon nhất", "bán chạy" → recommend = true
                
                === JSON ===
                {
                  "searchFood": true | false,
                  "foodName": string | null,
                  "categoryName": string | null,
                  "priceType": "cheapest" | "most_expensive" | null,
                  "minPrice": number | null,
                  "maxPrice": number | null,
                  "recommend": true | false,
                  "reply": "câu trả lời tiếng Việt"
                }
                
                Câu người dùng:
                "%s"
                """.formatted(userMessage);

        return callGemini(prompt, VoiceSearchIntent.class, getVoiceFallback());
    }

    // =====================================================
    // GEMINI CALL DÙNG CHUNG
    // =====================================================
    private <T> T callGemini(String prompt, Class<T> clazz, T fallback) {

        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "parts", List.of(
                                            Map.of("text", prompt)
                                    )
                            )
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<?> request = new HttpEntity<>(body, headers);
            String url = apiUrl + "?key=" + apiKey;

            ResponseEntity<String> res =
                    restTemplate.postForEntity(url, request, String.class);

            JsonNode root = mapper.readTree(res.getBody());
            String rawText = root
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text")
                    .asText();

            System.out.println("GEMINI RAW RESPONSE: " + rawText);

            String json = extractJson(rawText);
            return mapper.readValue(json, clazz);

        } catch (Exception e) {
            e.printStackTrace();
            return fallback;
        }
    }

    // =====================================================
    // FALLBACK
    // =====================================================
    private LlmIntent getChatFallback() {
        LlmIntent f = new LlmIntent();
        f.setOrderQuery(false);
        f.setProductQuery(false);
        f.setReply("Mình chưa hiểu rõ câu hỏi, bạn nói lại giúp mình nhé.");
        return f;
    }

    private VoiceSearchIntent getVoiceFallback() {
        VoiceSearchIntent f = new VoiceSearchIntent();
        f.setSearchFood(false);
        f.setReply("Mình chưa nghe rõ món bạn muốn tìm.");
        return f;
    }

    // =====================================================
    // JSON CUT
    // =====================================================
    private String extractJson(String raw) {
        int start = raw.indexOf("{");
        int end = raw.lastIndexOf("}");
        if (start >= 0 && end > start) {
            return raw.substring(start, end + 1);
        }
        throw new RuntimeException("Không tìm thấy JSON từ Gemini");
    }
}
