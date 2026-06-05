package com.example.hotel.service;

import java.util.List;

import com.example.hotel.entity.Promotion;

public interface PromotionService {
    List<Promotion> findAll();
    Promotion findById(Long id);
    Promotion create(Promotion promotion);
    Promotion update(Long id, Promotion promotion);
    void delete(Long id);
}
