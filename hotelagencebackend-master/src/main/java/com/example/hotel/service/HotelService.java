package com.example.hotel.service;

import java.util.List;

import com.example.hotel.entity.Hotel;

public interface HotelService {
    List<Hotel> findAll();
    List<Hotel> findByAgentId(Long agentId);
    Hotel findById(Long id);
    Hotel create(Hotel hotel);
    Hotel update(Long id, Hotel hotel);
    void delete(Long id);
    Hotel updateImage(Long id, String imageUrl);
}
