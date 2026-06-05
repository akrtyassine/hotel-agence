package com.example.hotel.service.impl;

import java.util.List;

import com.example.hotel.entity.Client;
import com.example.hotel.exception.ResourceNotFoundException;
import com.example.hotel.repository.ClientRepository;
import com.example.hotel.service.ClientService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClientServiceImpl implements ClientService {

    private final ClientRepository repository;

    public ClientServiceImpl(ClientRepository repository) {
        this.repository = repository;
    }

    public List<Client> findAll() { return repository.findAll(); }

    public Client findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Client not found: " + id));
    }

    public Client create(Client client) { return repository.save(client); }

    public Client update(Long id, Client client) {
        Client existing = findById(id);
        existing.setFullName(client.getFullName());
        existing.setEmail(client.getEmail());
        existing.setPhone(client.getPhone());
        if (client.getPassword() != null && !client.getPassword().isBlank()) {
            existing.setPassword(client.getPassword());
        }
        return repository.save(existing);
    }

    public void delete(Long id) { repository.delete(findById(id)); }

    public Client login(String email, String password) {
        return repository.findByEmailAndPassword(email, password)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect."));
    }
}
