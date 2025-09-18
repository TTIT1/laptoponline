package com.example.springbootlaptoop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestEmailController {

    @Autowired
    private JavaMailSender mailSender;

    @GetMapping("/email")
    public String testEmail() {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("thetruongit1236@gmail.com");
            message.setTo("thetruongit1236@gmail.com"); // Gửi cho chính mình để test
            message.setSubject("Test Email từ Spring Boot");
            message.setText("Đây là email test từ ứng dụng Spring Boot. Nếu bạn nhận được email này, có nghĩa là cấu hình email đã hoạt động!");
            
            mailSender.send(message);
            return "Email đã được gửi thành công!";
        } catch (Exception e) {
            return "Lỗi khi gửi email: " + e.getMessage();
        }
    }
}
