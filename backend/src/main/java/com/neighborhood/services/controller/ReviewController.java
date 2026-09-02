package com.neighborhood.services.controller;

import com.neighborhood.services.dto.ReviewRequest;
import com.neighborhood.services.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<?> createReview(
            Authentication authentication,
            @Valid @RequestBody ReviewRequest request
    ) {
        try {
            return ResponseEntity.ok(reviewService.createReview(authentication.getName(), request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<?> getReviewsForProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(reviewService.getReviewsForProvider(providerId));
    }

    @GetMapping("/booking/{bookingId}/exists")
    public ResponseEntity<?> hasReview(@PathVariable Long bookingId) {
        return ResponseEntity.ok(Map.of("reviewed", reviewService.hasReview(bookingId)));
    }
}