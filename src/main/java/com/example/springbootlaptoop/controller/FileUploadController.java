package com.example.springbootlaptoop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.springbootlaptoop.service.FileStorageService;
import java.util.Collections;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/{type}")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, @PathVariable String type) {
        try {
            String fileName = fileStorageService.storeFile(file, type);
            return ResponseEntity.ok(Collections.singletonMap("url", fileName));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Collections.singletonMap("message", "Lỗi khi upload file: " + e.getMessage()));
        }
    }
} 