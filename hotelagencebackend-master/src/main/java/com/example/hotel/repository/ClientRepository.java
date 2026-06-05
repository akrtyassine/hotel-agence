package com.example.hotel.repository;

import java.util.Optional;

import com.example.hotel.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByEmailAndPassword(String email, String password);
}
