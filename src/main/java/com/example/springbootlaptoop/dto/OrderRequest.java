package com.example.springbootlaptoop.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private Long userId;
    private String shippingAddress;
    private String phoneNumber;
    private String customerName;
    private List<OrderItemRequest> items;
    private String paymentMethod;
    private String note;
} 