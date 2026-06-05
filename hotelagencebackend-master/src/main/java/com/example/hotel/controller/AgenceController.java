package com.example.hotel.controller;

import java.util.List;

import com.example.hotel.entity.Agence;
import com.example.hotel.service.AgenceService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agences")
public class AgenceController {

    private final AgenceService service;

    public AgenceController(AgenceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Agence> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Agence findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Agence create(@RequestBody Agence agence) { return service.create(agence); }

    @PutMapping("/{id}")
    public Agence update(@PathVariable Long id, @RequestBody Agence agence) { return service.update(id, agence); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
