package com.example.demo.service;

import com.example.demo.entity.Voucher;
import com.example.demo.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.filters.ExpiresFilter;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;

    public List<Voucher> getAvailableVouchers() {
        for (Voucher voucher : voucherRepository.findAll()) {
            System.out.println("Voucher: " + voucher.getDiscountType());
        }
        return voucherRepository.findAllAvailableVouchers();
    }
    public boolean useVoucher(Long id, String code, String discountType) {

        Optional<Voucher> optionalVoucher =
                voucherRepository.findByIdAndCodeAndDiscountType(id, code, discountType);

        if (optionalVoucher.isEmpty()) {
            return false;
        }

        Voucher voucher = optionalVoucher.get();

        // kiểm tra còn số lượng
        if (voucher.getQuantity() == null || voucher.getQuantity() <= 0) {
            return false;
        }

        // trừ số lượng
        voucher.setQuantity(voucher.getQuantity() - 1);

        // tăng số lần sử dụng
        if (voucher.getUsedCount() == null) {
            voucher.setUsedCount(1);
        } else {
            voucher.setUsedCount(voucher.getUsedCount() + 1);
        }

        voucherRepository.save(voucher);

        return true;
    }
}

