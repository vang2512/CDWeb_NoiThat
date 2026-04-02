package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.service.VoiceSearchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/voice")
@CrossOrigin
public class VoiceSearchController {

    private final VoiceSearchService voiceSearchService;

    public VoiceSearchController(VoiceSearchService voiceSearchService) {
        this.voiceSearchService = voiceSearchService;
    }

    @PostMapping("/search")
    public Map<String, Object> search(@RequestBody Map<String, String> body) {

        String text = body.get("text");

        List<Product> foods = voiceSearchService.searchByVoice(text);
        return Map.of(
                "success", true,
                "count", foods.size(),
                "data", foods
        );
    }
}
