package com.example.hotel.controller;

import com.example.hotel.dto.AuthRequest;
import com.example.hotel.dto.AuthResponse;
import com.example.hotel.entity.Admin;
import com.example.hotel.repository.AdminRepository;
import com.example.hotel.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtService jwtService;
    private final AdminRepository adminRepository;

    public AuthController(JwtService jwtService, AdminRepository adminRepository) {
        this.jwtService = jwtService;
        this.adminRepository = adminRepository;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        Admin admin = adminRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides."));

        if (!admin.getPassword().equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides.");
        }

        String token = jwtService.generateToken(admin.getUsername());
        return new AuthResponse(token, admin.getRole().name(), admin.getId(), admin.getUsername());
    }
}
