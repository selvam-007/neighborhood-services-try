package com.neighborhood.services.dto;

import java.util.Set;

public class AuthResponse {

    private String token;
    private Long userId;
    private String email;
    private String fullName;
    private Set<String> roles;

    public AuthResponse(String token, Long userId, String email, String fullName, Set<String> roles) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public Set<String> getRoles() { return roles; }
}