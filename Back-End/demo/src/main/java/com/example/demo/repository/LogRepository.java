package com.example.demo.repository;

import com.example.demo.entity.Logs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogRepository extends JpaRepository<Logs, Long> {
    Page<Logs> findAllByOrderByCreatedAtDesc(Pageable pageable);
}