package com.example.hotel.service;

import java.util.List;

import com.example.hotel.entity.Agence;

public interface AgenceService {
    List<Agence> findAll();
    Agence findById(Long id);
    Agence create(Agence agence);
    Agence update(Long id, Agence agence);
    void delete(Long id);
}
