package com.neighborhood.services.repository;

import com.neighborhood.services.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByBookingIdOrderBySentAtAsc(Long bookingId);
}