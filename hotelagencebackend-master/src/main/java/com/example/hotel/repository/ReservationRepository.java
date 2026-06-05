package com.example.hotel.repository;

import java.util.List;

import com.example.hotel.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByHotelAgentId(Long agentId);
}
