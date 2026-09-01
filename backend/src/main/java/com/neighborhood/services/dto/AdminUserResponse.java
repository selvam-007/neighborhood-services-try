package com.neighborhood.services.dto;

import com.neighborhood.services.entity.User;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

public class AdminUserResponse {

    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Set<String> roles;
    private Instant createdAt;

    public AdminUserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.phoneNumber = user.getPhoneNumber();
        this.roles = user.getRoles().stream().map(Enum::name).collect(Collectors.toSet());
        this.createdAt = user.getCreatedAt();
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public Set<String> getRoles() { return roles; }
    public Instant getCreatedAt() { return createdAt; }
}