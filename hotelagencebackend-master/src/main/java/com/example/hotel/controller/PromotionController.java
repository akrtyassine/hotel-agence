package com.example.hotel.controller;

import java.util.List;

import com.example.hotel.entity.Promotion;
import com.example.hotel.service.PromotionService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService service;

    public PromotionController(PromotionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Promotion> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Promotion findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Promotion create(@RequestBody Promotion promotion) { return service.create(promotion); }

    @PutMapping("/{id}")
    public Promotion update(@PathVariable Long id, @RequestBody Promotion promotion) { return service.update(id, promotion); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
