package com.example.hotel.controller;

import java.util.List;

import com.example.hotel.entity.Admin;
import com.example.hotel.service.AdminService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    private final AdminService service;

    public AdminController(AdminService service) {
        this.service = service;
    }

    @GetMapping
    public List<Admin> findAll() { return service.findAll(); }

    @GetMapping("/agents")
    public List<Admin> findAgents() { return service.findAgents(); }

    @GetMapping("/{id}")
    public Admin findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Admin create(@RequestBody Admin admin) { return service.create(admin); }

    @PutMapping("/{id}")
    public Admin update(@PathVariable Long id, @RequestBody Admin admin) { return service.update(id, admin); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
