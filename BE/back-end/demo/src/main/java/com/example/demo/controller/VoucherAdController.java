package com.example.demo.controller;

import com.example.demo.entity.Voucher;
import com.example.demo.service.VoucherAdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VoucherAdController {

    private final VoucherAdService voucherAdService;

    // Load tất cả voucher
    @GetMapping
    public ResponseEntity<List<Voucher>> getAllVouchers() {
        return ResponseEntity.ok(voucherAdService.getAllVouchers());
    }

    // Lấy 1 voucher theo id
    @GetMapping("/{id}")
    public ResponseEntity<Voucher> getVoucherById(@PathVariable Long id) {
        return ResponseEntity.ok(voucherAdService.getVoucherById(id));
    }

    // Thêm voucher
    @PostMapping
    public ResponseEntity<Voucher> createVoucher(@RequestBody Voucher voucher) {
        return ResponseEntity.ok(voucherAdService.createVoucher(voucher));
    }

    // Cập nhật voucher
    @PutMapping("/{id}")
    public ResponseEntity<Voucher> updateVoucher(
            @PathVariable Long id,
            @RequestBody Voucher voucher) {
        return ResponseEntity.ok(voucherAdService.updateVoucher(id, voucher));
    }

    // Xóa voucher (tuỳ chọn)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        voucherAdService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }
}