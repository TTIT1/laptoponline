package com.example.springbootlaptoop.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Parameter {
    private String memory;
    private String ram;
    private double price;
    private String chip;

    public Parameter() {
    }

    public Parameter(String memory, String ram, double price, String chip) {
        this.memory = memory;
        this.ram = ram;
        this.price = price;
        this.chip = chip;
    }

    public String getMemory() {
        return memory;
    }

    public void setMemory(String memory) {
        this.memory = memory;
    }

    public String getRam() {
        return ram;
    }

    public void setRam(String ram) {
        this.ram = ram;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getChip() {
        return chip;
    }

    public void setChip(String chip) {
        this.chip = chip;
    }
}
