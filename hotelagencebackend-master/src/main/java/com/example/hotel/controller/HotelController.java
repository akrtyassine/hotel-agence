package com.example.hotel.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import com.example.hotel.entity.Hotel;
import com.example.hotel.service.HotelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelService service;

    public HotelController(HotelService service) {
        this.service = service;
    }

    @GetMapping
    public List<Hotel> findAll() { return service.findAll(); }

    @GetMapping("/agent/{agentId}")
    public List<Hotel> findByAgent(@PathVariable Long agentId) { return service.findByAgentId(agentId); }

    @GetMapping("/{id}")
    public Hotel findById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Hotel create(@RequestBody Hotel hotel) { return service.create(hotel); }

    @PutMapping("/{id}")
    public Hotel update(@PathVariable Long id, @RequestBody Hotel hotel) { return service.update(id, hotel); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }

    @PostMapping("/{id}/image")
    public ResponseEntity<Hotel> uploadImage(@PathVariable Long id,
                                             @RequestParam("file") MultipartFile file) throws IOException {
        String uploadDir = System.getProperty("user.dir") + "/uploads/hotels/";
        Files.createDirectories(Paths.get(uploadDir));
        String ext = file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")
                ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."))
                : "";
        String filename = UUID.randomUUID().toString() + ext;
        Path target = Paths.get(uploadDir + filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        Hotel updated = service.updateImage(id, "/uploads/hotels/" + filename);
        return ResponseEntity.ok(updated);
    }
}
