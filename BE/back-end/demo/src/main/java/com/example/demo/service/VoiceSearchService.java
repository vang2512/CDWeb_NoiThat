package com.example.demo.service;

import com.example.demo.dto.VoiceSearchIntent;
import com.example.demo.entity.Product;
import com.example.demo.repository.FoodRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoiceSearchService {

    private final LlmService llmService;
    private final FoodRepository foodRepository;

    public VoiceSearchService(LlmService llmService,
                              FoodRepository foodRepository) {
        this.llmService = llmService;
        this.foodRepository = foodRepository;
    }


    public List<Product> searchByVoice(String voiceText) {
        VoiceSearchIntent intent = llmService.extractVoiceSearch(voiceText);
        if (intent.getSearchFood() == null || !intent.getSearchFood()) {
            return List.of();
        }
        return foodRepository.findAll(
                FoodSpecification.filter(intent)
        );
    }
}
