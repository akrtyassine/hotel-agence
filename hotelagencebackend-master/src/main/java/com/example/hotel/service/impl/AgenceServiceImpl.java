package com.example.hotel.service.impl;

import java.util.List;

import com.example.hotel.entity.Agence;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.repository.AgenceRepository;
import com.example.hotel.service.AgenceService;
import org.springframework.stereotype.Service;

@Service
public class AgenceServiceImpl implements AgenceService {

    private final AgenceRepository repository;

    public AgenceServiceImpl(AgenceRepository repository) {
        this.repository = repository;
    }

    public List<Agence> findAll() { return repository.findAll(); }

    public Agence findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Agence not found: " + id));
    }

    public Agence create(Agence agence) { return repository.save(agence); }

    public Agence update(Long id, Agence agence) {
        Agence existing = findById(id);
        existing.setName(agence.getName());
        existing.setAddress(agence.getAddress());
        existing.setEmail(agence.getEmail());
        return repository.save(existing);
    }

    public void delete(Long id) { repository.delete(findById(id)); }
}
