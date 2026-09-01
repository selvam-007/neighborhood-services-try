package com.neighborhood.services.repository;

import com.neighborhood.services.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRequesterId(Long requesterId);
    List<Booking> findByProviderId(Long providerId);
    List<Booking> findByProviderIdAndStatus(Long providerId, Booking.Status status);
}