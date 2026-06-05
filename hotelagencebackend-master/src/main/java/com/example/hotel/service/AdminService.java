package com.example.hotel.service;

import java.util.List;

import com.example.hotel.entity.Admin;

public interface AdminService {
    List<Admin> findAll();
    List<Admin> findAgents();
    Admin findById(Long id);
    Admin create(Admin admin);
    Admin update(Long id, Admin admin);
    void delete(Long id);
}
