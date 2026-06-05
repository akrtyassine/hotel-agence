package com.example.hotel.service.impl;

import java.util.List;

import com.example.hotel.entity.Admin;
import com.example.hotel.entity.Role;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.repository.AdminRepository;
import com.example.hotel.service.AdminService;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImpl implements AdminService {

    private final AdminRepository repository;

    public AdminServiceImpl(AdminRepository repository) {
        this.repository = repository;
    }

    public List<Admin> findAll() { return repository.findAll(); }

    public List<Admin> findAgents() { return repository.findByRole(Role.AGENT); }

    public Admin findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + id));
    }

    public Admin create(Admin admin) { return repository.save(admin); }

    public Admin update(Long id, Admin admin) {
        Admin existing = findById(id);
        existing.setUsername(admin.getUsername());
        if (admin.getPassword() != null && !admin.getPassword().isBlank()) {
            existing.setPassword(admin.getPassword());
        }
        existing.setRole(admin.getRole());
        return repository.save(existing);
    }

    public void delete(Long id) { repository.delete(findById(id)); }
}
