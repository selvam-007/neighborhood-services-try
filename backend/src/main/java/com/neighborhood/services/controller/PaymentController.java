package com.neighborhood.services.controller;

import com.neighborhood.services.dto.PaymentRequest;
import com.neighborhood.services.dto.PaymentResponse;
import com.neighborhood.services.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> recordPayment(
            Authentication authentication,
            @Valid @RequestBody PaymentRequest request
    ) {
        return ResponseEntity.ok(paymentService.recordPayment(authentication.getName(), request));
    }

    @PatchMapping("/booking/{bookingId}/confirm")
    public ResponseEntity<PaymentResponse> confirmPayment(Authentication authentication, @PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.confirmPayment(authentication.getName(), bookingId));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponse> getPayment(Authentication authentication, @PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentForBooking(authentication.getName(), bookingId));
    }
}