package com.neighborhood.services.controller;

import com.neighborhood.services.dto.PaymentRequest;
import com.neighborhood.services.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<?> recordPayment(
            Authentication authentication,
            @Valid @RequestBody PaymentRequest request
    ) {
        try {
            return ResponseEntity.ok(paymentService.recordPayment(authentication.getName(), request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/booking/{bookingId}/confirm")
    public ResponseEntity<?> confirmPayment(Authentication authentication, @PathVariable Long bookingId) {
        try {
            return ResponseEntity.ok(paymentService.confirmPayment(authentication.getName(), bookingId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPayment(Authentication authentication, @PathVariable Long bookingId) {
        try {
            return ResponseEntity.ok(paymentService.getPaymentForBooking(authentication.getName(), bookingId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}