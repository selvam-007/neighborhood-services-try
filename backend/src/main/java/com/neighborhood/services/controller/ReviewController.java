package com.neighborhood.services.controller;

import com.neighborhood.services.dto.ReviewRequest;
import com.neighborhood.services.dto.ReviewResponse;
import com.neighborhood.services.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            Authentication authentication,
            @Valid @RequestBody ReviewRequest request
    ) {
        return ResponseEntity.ok(reviewService.createReview(authentication.getName(), request));
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsForProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(reviewService.getReviewsForProvider(providerId));
    }

    @GetMapping("/booking/{bookingId}/exists")
    public ResponseEntity<Map<String, Boolean>> hasReview(@PathVariable Long bookingId) {
        return ResponseEntity.ok(Map.of("reviewed", reviewService.hasReview(bookingId)));
    }
}