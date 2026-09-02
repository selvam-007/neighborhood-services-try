package com.neighborhood.services.dto;

import com.neighborhood.services.entity.Payment;

import java.math.BigDecimal;
import java.time.Instant;

public class PaymentResponse {

    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private String method;
    private String status;
    private String transactionReference;
    private Instant createdAt;
    private Instant updatedAt;

    public PaymentResponse(Payment payment) {
        this.id = payment.getId();
        this.bookingId = payment.getBooking().getId();
        this.amount = payment.getAmount();
        this.method = payment.getMethod().name();
        this.status = payment.getStatus().name();
        this.transactionReference = payment.getTransactionReference();
        this.createdAt = payment.getCreatedAt();
        this.updatedAt = payment.getUpdatedAt();
    }

    public Long getId() { return id; }
    public Long getBookingId() { return bookingId; }
    public BigDecimal getAmount() { return amount; }
    public String getMethod() { return method; }
    public String getStatus() { return status; }
    public String getTransactionReference() { return transactionReference; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}