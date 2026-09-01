package com.neighborhood.services.controller;

import com.neighborhood.services.dto.ChatMessageRequest;
import com.neighborhood.services.service.ChatMessageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings/{bookingId}/messages")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    public ChatMessageController(ChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(
            Authentication authentication,
            @PathVariable Long bookingId,
            @Valid @RequestBody ChatMessageRequest request
    ) {
        try {
            return ResponseEntity.ok(
                    chatMessageService.sendMessage(authentication.getName(), bookingId, request.getContent())
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getMessages(Authentication authentication, @PathVariable Long bookingId) {
        try {
            return ResponseEntity.ok(chatMessageService.getMessages(authentication.getName(), bookingId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}