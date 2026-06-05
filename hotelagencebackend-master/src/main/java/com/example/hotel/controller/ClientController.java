package com.example.hotel.controller;

import java.util.List;
import java.util.Map;

import com.example.hotel.entity.Client;
import com.example.hotel.service.ClientService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService service;

    public ClientController(ClientService service) {
        this.service = service;
    }

    @GetMapping
    public List<Client> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Client findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Client create(@RequestBody Client client) { return service.create(client); }

    @PostMapping("/login")
    public Client login(@RequestBody Map<String, String> body) {
        return service.login(body.get("email"), body.get("password"));
    }

    @PutMapping("/{id}")
    public Client update(@PathVariable Long id, @RequestBody Client client) { return service.update(id, client); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
