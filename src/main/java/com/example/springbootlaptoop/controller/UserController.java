package com.example.springbootlaptoop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.springbootlaptoop.service.UserService;
import com.example.springbootlaptoop.model.User;
import com.example.springbootlaptoop.dto.LoginRequest;
import com.example.springbootlaptoop.dto.ChangePasswordRequest;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return userService.login(request);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        return userService.changePassword(request);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        return userService.register(user);
    }
} 