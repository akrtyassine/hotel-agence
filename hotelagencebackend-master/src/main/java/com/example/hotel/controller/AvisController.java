package com.example.hotel.controller;

import java.util.List;

import com.example.hotel.entity.Avis;
import com.example.hotel.service.AvisService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/avis")
public class AvisController {

    private final AvisService service;

    public AvisController(AvisService service) {
        this.service = service;
    }

    @GetMapping
    public List<Avis> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Avis findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Avis create(@RequestBody Avis avis) { return service.create(avis); }

    @PutMapping("/{id}")
    public Avis update(@PathVariable Long id, @RequestBody Avis avis) { return service.update(id, avis); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
