package com.neighborhood.services.controller;

import com.neighborhood.services.dto.AdminStatsResponse;
import com.neighborhood.services.dto.AdminUserResponse;
import com.neighborhood.services.dto.BookingResponse;
import com.neighborhood.services.dto.PaymentResponse;
import com.neighborhood.services.dto.ProviderProfileResponse;
import com.neighborhood.services.entity.Booking;
import com.neighborhood.services.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @PatchMapping("/providers/{id}/verify")
    public ResponseEntity<ProviderProfileResponse> verifyProvider(@PathVariable Long id, @RequestParam boolean verified) {
        return ResponseEntity.ok(adminService.verifyProvider(id, verified));
    }

    @PatchMapping("/bookings/{id}/resolve")
    public ResponseEntity<BookingResponse> resolveBooking(@PathVariable Long id, @RequestParam Booking.Status status) {
        return ResponseEntity.ok(adminService.resolveBooking(id, status));
    }

    @PatchMapping("/payments/booking/{bookingId}/refund")
    public ResponseEntity<PaymentResponse> refundPayment(@PathVariable Long bookingId) {
        return ResponseEntity.ok(adminService.refundPayment(bookingId));
    }
}