package com.example.hotel.dto;

public class AuthResponse {
    private String token;
    private String role;
    private Long id;
    private String username;

    public AuthResponse() {}

    public AuthResponse(String token, String role, Long id, String username) {
        this.token = token;
        this.role = role;
        this.id = id;
        this.username = username;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
