package com.example.hotel.repository;

import java.util.List;

import com.example.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByAgentId(Long agentId);
}
