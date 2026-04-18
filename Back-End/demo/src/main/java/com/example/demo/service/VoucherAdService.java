package com.example.demo.service;

import com.example.demo.entity.Voucher;
import com.example.demo.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherAdService {

    private final VoucherRepository voucherRepository;

    // Load tất cả
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    // Lấy 1 voucher theo id
    public Voucher getVoucherById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher id = " + id));
    }

    // Thêm voucher
    public Voucher createVoucher(Voucher voucher) {
        voucher.setId(null);
        // createdAt tự động set
        voucher.setCreatedAt(LocalDateTime.now());

        // status mặc định ACTIVE
        if (voucher.getStatus() == null) {
            voucher.setStatus("ACTIVE");
        }
        return voucherRepository.save(voucher);
    }

    // Cập nhật voucher
    public Voucher updateVoucher(Long id, Voucher updatedVoucher) {

        Voucher existingVoucher = getVoucherById(id);

        existingVoucher.setCode(updatedVoucher.getCode());
        existingVoucher.setDiscountType(updatedVoucher.getDiscountType());
        existingVoucher.setDiscountValue(updatedVoucher.getDiscountValue());
        existingVoucher.setQuantity(updatedVoucher.getQuantity());
        existingVoucher.setMinOrderValue(updatedVoucher.getMinOrderValue());
        existingVoucher.setStartDate(updatedVoucher.getStartDate());
        existingVoucher.setEndDate(updatedVoucher.getEndDate());

        return voucherRepository.save(existingVoucher);
    }

    // Xóa voucher (nếu cần)
    public void deleteVoucher(Long id) {
        voucherRepository.deleteById(id);
    }
}