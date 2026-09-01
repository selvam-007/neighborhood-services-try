package com.neighborhood.services.repository;

import com.neighborhood.services.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByBookingId(Long bookingId);
    boolean existsByBookingId(Long bookingId);
    List<Review> findByProviderIdOrderByCreatedAtDesc(Long providerId);
}