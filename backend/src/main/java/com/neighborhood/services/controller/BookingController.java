package com.neighborhood.services.controller;

import com.neighborhood.services.dto.BookingRequest;
import com.neighborhood.services.dto.BookingResponse;
import com.neighborhood.services.dto.BookingStatusUpdateRequest;
import com.neighborhood.services.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            Authentication authentication,
            @Valid @RequestBody BookingRequest request
    ) {
        try {
            return ResponseEntity.ok(bookingService.createBooking(authentication.getName(), request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateRequest request
    ) {
        try {
            return ResponseEntity.ok(bookingService.updateStatus(authentication.getName(), id, request.getStatus()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/as-requester")
    public ResponseEntity<List<BookingResponse>> getMyBookingsAsRequester(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getMyBookingsAsRequester(authentication.getName()));
    }

    @GetMapping("/as-provider")
    public ResponseEntity<?> getMyBookingsAsProvider(Authentication authentication) {
        try {
            return ResponseEntity.ok(bookingService.getMyBookingsAsProvider(authentication.getName()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}