package com.example.hotel.security;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

    public String generateToken(String username) {
        return Base64.getEncoder().encodeToString(("token:" + username).getBytes(StandardCharsets.UTF_8));
    }

    public String extractUsername(String token) {
        try {
            String decoded = new String(Base64.getDecoder().decode(token), StandardCharsets.UTF_8);
            if (decoded.startsWith("token:")) {
                return decoded.substring("token:".length());
            }
        } catch (IllegalArgumentException ignored) {
            return null;
        }
        return null;
    }

    public boolean isTokenValid(String token, String username) {
        String extracted = extractUsername(token);
        return extracted != null && extracted.equals(username);
    }
}
