package com.neighborhood.services.service;

import com.neighborhood.services.dto.AdminStatsResponse;
import com.neighborhood.services.dto.AdminUserResponse;
import com.neighborhood.services.dto.BookingResponse;
import com.neighborhood.services.dto.PaymentResponse;
import com.neighborhood.services.dto.ProviderProfileResponse;
import com.neighborhood.services.entity.Booking;
import com.neighborhood.services.entity.Payment;
import com.neighborhood.services.entity.ProviderProfile;
import com.neighborhood.services.exception.ResourceNotFoundException;
import com.neighborhood.services.repository.BookingRepository;
import com.neighborhood.services.repository.PaymentRepository;
import com.neighborhood.services.repository.ProviderProfileRepository;
import com.neighborhood.services.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public AdminService(
            UserRepository userRepository,
            ProviderProfileRepository providerProfileRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository
    ) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalProviders = providerProfileRepository.count();
        long verifiedProviders = providerProfileRepository.findAll().stream()
                .filter(ProviderProfile::isVerified)
                .count();

        List<Booking> allBookings = bookingRepository.findAll();
        long totalBookings = allBookings.size();

        Set<Booking.Status> activeStatuses = Set.of(
                Booking.Status.REQUESTED, Booking.Status.ACCEPTED, Booking.Status.IN_PROGRESS
        );
        Set<Booking.Status> endedBadStatuses = Set.of(
                Booking.Status.REJECTED, Booking.Status.CANCELLED
        );

        long completedBookings = allBookings.stream()
                .filter(b -> b.getStatus() == Booking.Status.COMPLETED)
                .count();
        long activeBookings = allBookings.stream()
                .filter(b -> activeStatuses.contains(b.getStatus()))
                .count();
        long cancelledOrRejectedBookings = allBookings.stream()
                .filter(b -> endedBadStatuses.contains(b.getStatus()))
                .count();

        return new AdminStatsResponse(
                totalUsers, totalProviders, verifiedProviders,
                totalBookings, completedBookings, activeBookings, cancelledOrRejectedBookings
        );
    }

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(AdminUserResponse::new)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    public ProviderProfileResponse verifyProvider(Long providerId, boolean verified) {
        ProviderProfile profile = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        profile.setVerified(verified);
        return new ProviderProfileResponse(providerProfileRepository.save(profile));
    }

    public BookingResponse resolveBooking(Long bookingId, Booking.Status resolvedStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(resolvedStatus);
        return new BookingResponse(bookingRepository.save(booking));
    }

    public PaymentResponse refundPayment(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No payment record found for this booking"));

        payment.setStatus(Payment.Status.REFUNDED);
        return new PaymentResponse(paymentRepository.save(payment));
    }
}