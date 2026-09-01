package com.neighborhood.services.dto;

import com.neighborhood.services.entity.Booking;

import java.time.Instant;
import java.time.LocalDate;

public class BookingResponse {

    private Long id;
    private Long requesterId;
    private String requesterName;
    private Long providerId;
    private String providerName;
    private String serviceType;
    private String notes;
    private LocalDate requestedDate;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    public BookingResponse(Booking booking) {
        this.id = booking.getId();
        this.requesterId = booking.getRequester().getId();
        this.requesterName = booking.getRequester().getFullName();
        this.providerId = booking.getProvider().getId();
        this.providerName = booking.getProvider().getUser().getFullName();
        this.serviceType = booking.getServiceType();
        this.notes = booking.getNotes();
        this.requestedDate = booking.getRequestedDate();
        this.status = booking.getStatus().name();
        this.createdAt = booking.getCreatedAt();
        this.updatedAt = booking.getUpdatedAt();
    }

    public Long getId() { return id; }
    public Long getRequesterId() { return requesterId; }
    public String getRequesterName() { return requesterName; }
    public Long getProviderId() { return providerId; }
    public String getProviderName() { return providerName; }
    public String getServiceType() { return serviceType; }
    public String getNotes() { return notes; }
    public LocalDate getRequestedDate() { return requestedDate; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}