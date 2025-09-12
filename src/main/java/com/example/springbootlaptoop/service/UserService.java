package com.example.springbootlaptoop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.springbootlaptoop.dto.ChangePasswordRequest;
import com.example.springbootlaptoop.dto.LoginRequest;
import com.example.springbootlaptoop.model.User;
import com.example.springbootlaptoop.repository.UserRepository;

import jakarta.annotation.PostConstruct;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;



@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @PostConstruct
    public void init() {
        userRepository.deleteAll();
        
        if (userRepository.findByUsername("admin").isEmpty()) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword("admin123");
            adminUser.setEmail("admin@example.com");
            adminUser.setRole("ADMIN");
            userRepository.save(adminUser);
        }
    }
    
    public ResponseEntity<?> login(LoginRequest request) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Không tìm thấy người dùng"));
            }
            
            User user = userOptional.get();
            if (user.getPassword().equals(request.getPassword())) {
                Map<String, Object> response = new HashMap<>();
                response.put("token", "fake-token");
                response.put("username", user.getUsername());
                response.put("role", user.getRole());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Sai mật khẩu"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("message", "Đăng nhập thất bại: " + e.getMessage()));
        }
    }
 public ResponseEntity<?>register(User user) {
    return ResponseEntity.ok().build();
 }

    public ResponseEntity<?> changePassword(ChangePasswordRequest request) {
        try {
            // Tìm user theo username từ token
            Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "Không tìm thấy người dùng"));
            }

            User user = userOptional.get();
            // Kiểm tra mật khẩu cũ
            if (!user.getPassword().equals(request.getOldPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Mật khẩu cũ không đúng"));
            }

            // Cập nhật mật khẩu mới
            user.setPassword(request.getNewPassword());
            userRepository.save(user);

            return ResponseEntity.ok()
                .body(Collections.singletonMap("message", "Đổi mật khẩu thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("message", "Lỗi khi đổi mật khẩu: " + e.getMessage()));
        }
    }
    
} 