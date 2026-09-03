package com.neighborhood.services.service;

import com.neighborhood.services.dto.PaymentRequest;
import com.neighborhood.services.dto.PaymentResponse;
import com.neighborhood.services.entity.Booking;
import com.neighborhood.services.entity.Payment;
import com.neighborhood.services.entity.User;
import com.neighborhood.services.repository.BookingRepository;
import com.neighborhood.services.repository.PaymentRepository;
import com.neighborhood.services.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    public PaymentResponse recordPayment(String requesterEmail, PaymentRequest request) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getRequester().getId().equals(requester.getId())) {
            throw new IllegalArgumentException("Only the requester can record payment for this booking");
        }

        if (booking.getStatus() != Booking.Status.COMPLETED) {
            throw new IllegalArgumentException("Payment can only be recorded for a completed booking");
        }

        if (paymentRepository.existsByBookingId(booking.getId())) {
            throw new IllegalArgumentException("A payment record already exists for this booking");
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod());
        payment.setTransactionReference(request.getTransactionReference());
        payment.setStatus(Payment.Status.PENDING);

        return new PaymentResponse(paymentRepository.save(payment));
    }

    public PaymentResponse confirmPayment(String providerEmail, Long bookingId) {
        User provider = userRepository.findByEmail(providerEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("No payment record found for this booking"));

        if (!payment.getBooking().getProvider().getUser().getId().equals(provider.getId())) {
            throw new IllegalArgumentException("Only the provider can confirm this payment");
        }

        if (payment.getStatus() != Payment.Status.PENDING) {
            throw new IllegalArgumentException("Only a pending payment can be confirmed");
        }

        payment.setStatus(Payment.Status.PAID);
        return new PaymentResponse(paymentRepository.save(payment));
    }

    public PaymentResponse getPaymentForBooking(String userEmail, Long bookingId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("No payment record found for this booking"));

        boolean isRequester = payment.getBooking().getRequester().getId().equals(user.getId());
        boolean isProvider = payment.getBooking().getProvider().getUser().getId().equals(user.getId());

        if (!isRequester && !isProvider) {
            throw new IllegalArgumentException("You are not part of this booking");
        }

        return new PaymentResponse(payment);
    }
}