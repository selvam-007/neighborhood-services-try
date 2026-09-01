package com.neighborhood.services.dto;

import com.neighborhood.services.entity.ChatMessage;

import java.time.Instant;

public class ChatMessageResponse {

    private Long id;
    private Long bookingId;
    private Long senderId;
    private String senderName;
    private String content;
    private Instant sentAt;

    public ChatMessageResponse(ChatMessage message) {
        this.id = message.getId();
        this.bookingId = message.getBooking().getId();
        this.senderId = message.getSender().getId();
        this.senderName = message.getSender().getFullName();
        this.content = message.getContent();
        this.sentAt = message.getSentAt();
    }

    public Long getId() { return id; }
    public Long getBookingId() { return bookingId; }
    public Long getSenderId() { return senderId; }
    public String getSenderName() { return senderName; }
    public String getContent() { return content; }
    public Instant getSentAt() { return sentAt; }
}