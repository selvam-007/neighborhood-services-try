package com.neighborhood.services.service;

import com.neighborhood.services.dto.ChatMessageResponse;
import com.neighborhood.services.entity.Booking;
import com.neighborhood.services.entity.ChatMessage;
import com.neighborhood.services.entity.User;
import com.neighborhood.services.repository.BookingRepository;
import com.neighborhood.services.repository.ChatMessageRepository;
import com.neighborhood.services.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public ChatMessageService(
            ChatMessageRepository chatMessageRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository
    ) {
        this.chatMessageRepository = chatMessageRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    private void verifyParticipant(Booking booking, User user) {
        boolean isRequester = booking.getRequester().getId().equals(user.getId());
        boolean isProvider = booking.getProvider().getUser().getId().equals(user.getId());
        if (!isRequester && !isProvider) {
            throw new IllegalArgumentException("You are not part of this booking's conversation");
        }
    }

    public ChatMessageResponse sendMessage(String senderEmail, Long bookingId, String content) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        verifyParticipant(booking, sender);

        if (booking.getStatus() == Booking.Status.CANCELLED ||
                booking.getStatus() == Booking.Status.REJECTED) {
            throw new IllegalArgumentException("Cannot send messages on a cancelled or rejected booking");
        }

        ChatMessage message = new ChatMessage();
        message.setBooking(booking);
        message.setSender(sender);
        message.setContent(content);

        return new ChatMessageResponse(chatMessageRepository.save(message));
    }

    public List<ChatMessageResponse> getMessages(String userEmail, Long bookingId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        verifyParticipant(booking, user);

        return chatMessageRepository.findByBookingIdOrderBySentAtAsc(bookingId).stream()
                .map(ChatMessageResponse::new)
                .collect(Collectors.toList());
    }
}