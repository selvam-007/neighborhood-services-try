package com.neighborhood.services.controller;

import com.neighborhood.services.dto.ChatMessageRequest;
import com.neighborhood.services.dto.ChatMessageResponse;
import com.neighborhood.services.service.ChatMessageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings/{bookingId}/messages")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    public ChatMessageController(ChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    @PostMapping
    public ResponseEntity<ChatMessageResponse> sendMessage(
            Authentication authentication,
            @PathVariable Long bookingId,
            @Valid @RequestBody ChatMessageRequest request
    ) {
        return ResponseEntity.ok(
                chatMessageService.sendMessage(authentication.getName(), bookingId, request.getContent())
        );
    }

    @GetMapping
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            Authentication authentication,
            @PathVariable Long bookingId
    ) {
        return ResponseEntity.ok(chatMessageService.getMessages(authentication.getName(), bookingId));
    }
}