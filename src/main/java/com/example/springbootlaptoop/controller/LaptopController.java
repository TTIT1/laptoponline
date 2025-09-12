package com.example.springbootlaptoop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.springbootlaptoop.service.LaptopService;
import com.example.springbootlaptoop.model.Laptop;
import java.util.List;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import java.util.Collections;
@RestController
@RequestMapping("/laptop")
public class LaptopController {

    @Autowired
    private LaptopService laptopService;

    @GetMapping("/getAll")
    public List<Laptop> getAllLaptops() {
        return laptopService.getAllLaptops();
    }

    @PostMapping("/add")
    public ResponseEntity<?> addLaptop(@RequestBody Laptop laptop) {
        try {
            Laptop savedLaptop = laptopService.addLaptop(laptop);
            return ResponseEntity.ok(savedLaptop);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Collections.singletonMap("message", "Lỗi khi thêm laptop: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    public void deleteLaptop(@PathVariable Long id) {
        laptopService.deleteLaptopById(id);
    }

     @PutMapping("/update/{id}")
    public Laptop updeta (@PathVariable Long id , @RequestBody Laptop laptop) {
         Laptop laptop1 = laptopService.findById(id).orElseThrow();

         laptop1.setLaptopName(laptop.getLaptopName());
         laptop1.setTrademark(laptop.getTrademark());

         if (laptop1.getParameter() != null) {
                laptop1.getParameter().setChip(laptop.getParameter().getChip());
                laptop1.getParameter().setMemory(laptop.getParameter().getMemory());
                laptop1.getParameter().setRam(laptop.getParameter().getRam());
                laptop1.getParameter().setPrice(laptop.getParameter().getPrice());

         }
         return laptopService.updeta(laptop1);

     }
}


