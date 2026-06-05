package com.example.hotel.service;

import java.util.List;

import com.example.hotel.entity.Reservation;

public interface ReservationService {
    List<Reservation> findAll();
    List<Reservation> findByAgentId(Long agentId);
    Reservation findById(Long id);
    Reservation create(Reservation reservation);
    Reservation update(Long id, Reservation reservation);
    void delete(Long id);
    Reservation validate(Long id);
    Reservation reject(Long id);
}
