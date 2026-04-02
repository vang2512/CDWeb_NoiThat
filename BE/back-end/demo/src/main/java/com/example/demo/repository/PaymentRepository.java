package com.example.demo.repository;

import com.example.demo.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {}

