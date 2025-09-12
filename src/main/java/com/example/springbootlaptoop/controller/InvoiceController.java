package com.example.springbootlaptoop.controller;

import com.example.springbootlaptoop.model.Invoice;
import com.example.springbootlaptoop.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping("/create")
    public ResponseEntity<?> createInvoice(@RequestBody Invoice invoice) {
        try {
            Invoice savedInvoice = invoiceService.createInvoice(invoice);
            return ResponseEntity.ok(savedInvoice);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tạo hóa đơn: " + e.getMessage());
        }
    }
} 