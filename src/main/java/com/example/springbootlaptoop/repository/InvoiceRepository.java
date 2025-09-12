package com.example.springbootlaptoop.repository;

import com.example.springbootlaptoop.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
} 