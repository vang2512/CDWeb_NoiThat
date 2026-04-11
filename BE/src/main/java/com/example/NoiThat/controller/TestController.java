package com.example.NoiThat.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;

@RestController
public class TestController {

    @GetMapping("/api/test")
    @Operation(summary = "API test", description = "Trả về hello")
    public String hello() {
        return "Hello Swagger";
    }
}