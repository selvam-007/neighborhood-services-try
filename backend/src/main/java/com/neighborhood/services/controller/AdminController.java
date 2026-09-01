package com.neighborhood.services.controller;

import com.neighborhood.services.entity.Booking;
import com.neighborhood.services.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @PatchMapping("/providers/{id}/verify")
    public ResponseEntity<?> verifyProvider(@PathVariable Long id, @RequestParam boolean verified) {
        try {
            return ResponseEntity.ok(adminService.verifyProvider(id, verified));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/bookings/{id}/resolve")
    public ResponseEntity<?> resolveBooking(@PathVariable Long id, @RequestParam Booking.Status status) {
        try {
            return ResponseEntity.ok(adminService.resolveBooking(id, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}