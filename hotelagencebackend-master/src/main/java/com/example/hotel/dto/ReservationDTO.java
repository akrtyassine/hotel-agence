package com.example.hotel.dto;

import java.time.LocalDate;

public class ReservationDTO {
    private Long id;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Double totalPrice;
    private Long hotelId;
    private Long clientId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }
    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
}
