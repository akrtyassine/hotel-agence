package com.example.hotel.service.impl;

import java.util.List;

import com.example.hotel.entity.Reservation;
import com.example.hotel.entity.ReservationStatus;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.repository.ReservationRepository;
import com.example.hotel.service.ReservationService;
import org.springframework.stereotype.Service;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository repository;

    public ReservationServiceImpl(ReservationRepository repository) {
        this.repository = repository;
    }

    public List<Reservation> findAll() { return repository.findAll(); }

    public List<Reservation> findByAgentId(Long agentId) { return repository.findByHotelAgentId(agentId); }

    public Reservation findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id));
    }

    public Reservation create(Reservation reservation) {
        reservation.setStatus(ReservationStatus.PENDING);
        return repository.save(reservation);
    }

    public Reservation update(Long id, Reservation reservation) {
        Reservation existing = findById(id);
        existing.setCheckInDate(reservation.getCheckInDate());
        existing.setCheckOutDate(reservation.getCheckOutDate());
        existing.setTotalPrice(reservation.getTotalPrice());
        existing.setHotel(reservation.getHotel());
        existing.setClient(reservation.getClient());
        return repository.save(existing);
    }

    public void delete(Long id) { repository.delete(findById(id)); }

    public Reservation validate(Long id) {
        Reservation r = findById(id);
        r.setStatus(ReservationStatus.VALIDATED);
        return repository.save(r);
    }

    public Reservation reject(Long id) {
        Reservation r = findById(id);
        r.setStatus(ReservationStatus.REJECTED);
        return repository.save(r);
    }
}
