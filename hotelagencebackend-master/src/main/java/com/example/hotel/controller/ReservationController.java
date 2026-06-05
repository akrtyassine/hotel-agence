package com.example.hotel.controller;

import java.util.List;

import com.example.hotel.entity.Reservation;
import com.example.hotel.service.ReservationService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService service;

    public ReservationController(ReservationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Reservation> findAll() { return service.findAll(); }

    @GetMapping("/agent/{agentId}")
    public List<Reservation> findByAgent(@PathVariable Long agentId) { return service.findByAgentId(agentId); }

    @GetMapping("/{id}")
    public Reservation findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Reservation create(@RequestBody Reservation reservation) { return service.create(reservation); }

    @PutMapping("/{id}")
    public Reservation update(@PathVariable Long id, @RequestBody Reservation reservation) { return service.update(id, reservation); }

    @PutMapping("/{id}/validate")
    public Reservation validate(@PathVariable Long id) { return service.validate(id); }

    @PutMapping("/{id}/reject")
    public Reservation reject(@PathVariable Long id) { return service.reject(id); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
