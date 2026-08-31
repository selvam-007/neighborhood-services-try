package com.neighborhood.services.controller;

import com.neighborhood.services.dto.ProviderProfileRequest;
import com.neighborhood.services.dto.ProviderProfileResponse;
import com.neighborhood.services.entity.ProviderProfile;
import com.neighborhood.services.service.FileUploadService;
import com.neighborhood.services.service.ProviderProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/providers")
public class ProviderProfileController {

    private final ProviderProfileService providerProfileService;
    private final FileUploadService fileUploadService;

    public ProviderProfileController(ProviderProfileService providerProfileService, FileUploadService fileUploadService) {
        this.providerProfileService = providerProfileService;
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/profile")
    public ResponseEntity<?> createOrUpdateProfile(
            Authentication authentication,
            @Valid @RequestBody ProviderProfileRequest request
    ) {
        try {
            ProviderProfileResponse response = providerProfileService.createOrUpdateProfile(
                    authentication.getName(), request
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/profile/image")
    public ResponseEntity<?> uploadProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            String imageUrl = fileUploadService.uploadImage(file);
            ProviderProfileResponse response = providerProfileService.updateProfileImage(
                    authentication.getName(), imageUrl
            );
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Image upload failed"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {
            return ResponseEntity.ok(providerProfileService.getMyProfile(authentication.getName()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfileById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(providerProfileService.getProfileById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ProviderProfileResponse>> getAllProfiles(
            @RequestParam(required = false) ProviderProfile.ServiceType service
    ) {
        if (service != null) {
            return ResponseEntity.ok(providerProfileService.getProfilesByService(service));
        }
        return ResponseEntity.ok(providerProfileService.getAllProfiles());
    }
}