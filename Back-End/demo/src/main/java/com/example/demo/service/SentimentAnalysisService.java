package com.example.demo.service;

import com.example.demo.dto.SentimentResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SentimentAnalysisService {

    private final RestTemplate restTemplate;

    public SentimentAnalysisService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String analyze(String comment) {

        Map<String, String> request = new HashMap<>();
        request.put("text", comment);

        ResponseEntity<SentimentResponse> response =
                restTemplate.postForEntity(
                        "http://localhost:8000/sentiment",
                        request,
                        SentimentResponse.class
                );

        return response.getBody().getSentiment();
    }
}
