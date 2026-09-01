package com.neighborhood.services.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatMessageRequest {

    @NotBlank(message = "Message cannot be empty")
    private String content;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}