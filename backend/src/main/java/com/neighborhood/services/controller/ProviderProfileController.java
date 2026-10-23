package com.neighborhood.services.controller;

import com.neighborhood.services.dto.ProviderProfileRequest;
import com.neighborhood.services.dto.ProviderProfileResponse;
import com.neighborhood.services.entity.ProviderProfile;
import com.neighborhood.services.service.FileUploadService;
import com.neighborhood.services.service.ProviderProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

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
    public ResponseEntity<ProviderProfileResponse> createOrUpdateProfile(
            Authentication authentication,
            @Valid @RequestBody ProviderProfileRequest request
    ) {
        ProviderProfileResponse response = providerProfileService.createOrUpdateProfile(
                authentication.getName(), request
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/profile/image")
    public ResponseEntity<ProviderProfileResponse> uploadProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        String imageUrl = fileUploadService.uploadImage(file);
        ProviderProfileResponse response = providerProfileService.updateProfileImage(
                authentication.getName(), imageUrl
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/me")
    public ResponseEntity<ProviderProfileResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(providerProfileService.getMyProfile(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProviderProfileResponse> getProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(providerProfileService.getProfileById(id));
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