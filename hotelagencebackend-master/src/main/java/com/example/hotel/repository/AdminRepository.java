package com.example.hotel.repository;

import java.util.List;
import java.util.Optional;

import com.example.hotel.entity.Admin;
import com.example.hotel.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUsername(String username);
    List<Admin> findByRole(Role role);
}
