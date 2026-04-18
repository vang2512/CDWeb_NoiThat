package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;
import com.example.demo.service.ChatbotService;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<?> chatbotMessage(@RequestBody Map<String, Object> body) {

        String message = body.get("message").toString();
        int userId = Integer.parseInt(body.get("userId").toString());
        return ResponseEntity.ok(chatbotService.getReply(message, userId));
    }

}
