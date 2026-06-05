package com.example.hotel.service.impl;

import java.util.List;

import com.example.hotel.entity.Promotion;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.repository.PromotionRepository;
import com.example.hotel.service.PromotionService;
import org.springframework.stereotype.Service;

@Service
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository repository;

    public PromotionServiceImpl(PromotionRepository repository) {
        this.repository = repository;
    }

    public List<Promotion> findAll() { return repository.findAll(); }

    public Promotion findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Promotion not found: " + id));
    }

    public Promotion create(Promotion promotion) { return repository.save(promotion); }

    public Promotion update(Long id, Promotion promotion) {
        Promotion existing = findById(id);
        existing.setCode(promotion.getCode());
        existing.setDiscountPercent(promotion.getDiscountPercent());
        existing.setStartDate(promotion.getStartDate());
        existing.setEndDate(promotion.getEndDate());
        existing.setHotel(promotion.getHotel());
        return repository.save(existing);
    }

    public void delete(Long id) { repository.delete(findById(id)); }
}
