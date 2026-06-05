package com.example.hotel.service;

import java.util.List;

import com.example.hotel.entity.Client;

public interface ClientService {
    List<Client> findAll();
    Client findById(Long id);
    Client create(Client client);
    Client update(Long id, Client client);
    void delete(Long id);
    Client login(String email, String password);
}
