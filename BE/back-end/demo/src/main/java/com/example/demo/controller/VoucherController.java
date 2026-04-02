package com.example.demo.controller;

import com.example.demo.entity.Voucher;
import com.example.demo.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
@CrossOrigin
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping("/available")
    public ResponseEntity<List<Voucher>> getAvailableVouchers() {
        return ResponseEntity.ok(voucherService.getAvailableVouchers());
    }
    @PostMapping("/use")
    public Map<String, Object> useVoucher(
            @RequestParam Long id,
            @RequestParam String code,
            @RequestParam String discountType
    ) {

        boolean success = voucherService.useVoucher(id, code, discountType);

        Map<String, Object> response = new HashMap<>();
        response.put("success", success);

        if (success) {
            response.put("message", "Áp dụng voucher thành công");
        } else {
            response.put("message", "Voucher không hợp lệ hoặc đã hết");
        }
        return response;
    }
}

