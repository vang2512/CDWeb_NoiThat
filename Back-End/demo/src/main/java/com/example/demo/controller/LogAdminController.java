package com.example.demo.controller;

import com.example.demo.dto.LogDTO;
import com.example.demo.entity.Logs;
import com.example.demo.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/logs")
@CrossOrigin("*")
public class LogAdminController {

    @Autowired
    private LogService logService;

    @GetMapping
    public Page<LogDTO> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type
    ) {
        return logService.getAllLogs(
                PageRequest.of(page, size),
                type
        );
    }
}
