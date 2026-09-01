package com.neighborhood.services.dto;

import jakarta.validation.constraints.NotNull;
import com.neighborhood.services.entity.Booking;

public class BookingStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private Booking.Status status;

    public Booking.Status getStatus() { return status; }
    public void setStatus(Booking.Status status) { this.status = status; }
}