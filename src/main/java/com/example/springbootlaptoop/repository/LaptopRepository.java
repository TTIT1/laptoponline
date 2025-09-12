package com.example.springbootlaptoop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.springbootlaptoop.model.Laptop;

@Repository
public interface LaptopRepository extends JpaRepository<Laptop,Long> {
}
