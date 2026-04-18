package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code;

    @Column(name = "discount_type", nullable = false)
    private String discountType; 

    @Column(name = "discount_value", nullable = true)
    private BigDecimal discountValue;

    @Column(name = "min_order_value")
    private BigDecimal minOrderValue;


    @Column(nullable = true)
    private Integer quantity;

    @Column(name = "used_count")
    private Integer usedCount = 0;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String status; // ACTIVE | INACTIVE

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
