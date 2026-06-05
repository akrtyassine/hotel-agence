package com.example.hotel.service;

import java.util.List;

import com.example.hotel.entity.Avis;

public interface AvisService {
    List<Avis> findAll();
    Avis findById(Long id);
    Avis create(Avis avis);
    Avis update(Long id, Avis avis);
    void delete(Long id);
}
