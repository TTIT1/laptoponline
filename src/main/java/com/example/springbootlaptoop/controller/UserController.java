package com.example.springbootlaptoop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springbootlaptoop.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    
    @Autowired
    private UserService userService;

     @PostMapping("/dk")
     public ResponseEntity<Boolean> dangky(@RequestBody UserResgest resgest){
        Boolean kt = userService.resgiest(resgest);
        return ResponseEntity.status(HttpStatus.OK).body(kt);
     }


    
    }