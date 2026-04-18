package com.example.demo.repository;

import com.example.demo.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    @Query("""
    SELECT v FROM Voucher v
    WHERE v.status = 'ACTIVE'
    AND (
        (v.code = 'FREESHIP' AND v.discountType = 'FREE')
        OR
        (
            v.startDate <= CURRENT_TIMESTAMP
            AND v.endDate >= CURRENT_TIMESTAMP
        )
    )
""")
    List<Voucher> findAllAvailableVouchers();
    Optional<Voucher> findByIdAndCodeAndDiscountType(Long id, String code, String discountType);

}

