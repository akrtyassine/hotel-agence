package com.example.hotel.service.impl;

import java.util.List;

import com.example.hotel.entity.Avis;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.repository.AvisRepository;
import com.example.hotel.service.AvisService;
import org.springframework.stereotype.Service;

@Service
public class AvisServiceImpl implements AvisService {

    private final AvisRepository repository;

    public AvisServiceImpl(AvisRepository repository) {
        this.repository = repository;
    }

    public List<Avis> findAll() { return repository.findAll(); }

    public Avis findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Avis not found: " + id));
    }

    public Avis create(Avis avis) { return repository.save(avis); }

    public Avis update(Long id, Avis avis) {
        Avis existing = findById(id);
        existing.setRating(avis.getRating());
        existing.setComment(avis.getComment());
        existing.setHotel(avis.getHotel());
        existing.setClient(avis.getClient());
        return repository.save(existing);
    }

    public void delete(Long id) { repository.delete(findById(id)); }
}
