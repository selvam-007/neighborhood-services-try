package com.neighborhood.services.service;

import com.neighborhood.services.dto.ProviderProfileRequest;
import com.neighborhood.services.dto.ProviderProfileResponse;
import com.neighborhood.services.entity.ProviderProfile;
import com.neighborhood.services.entity.User;
import com.neighborhood.services.repository.ProviderProfileRepository;
import com.neighborhood.services.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProviderProfileService {

    private final ProviderProfileRepository providerProfileRepository;
    private final UserRepository userRepository;

    public ProviderProfileService(ProviderProfileRepository providerProfileRepository, UserRepository userRepository) {
        this.providerProfileRepository = providerProfileRepository;
        this.userRepository = userRepository;
    }

    public ProviderProfileResponse createOrUpdateProfile(String userEmail, ProviderProfileRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                .orElseGet(ProviderProfile::new);

        profile.setUser(user);
        profile.setBio(request.getBio());
        profile.setServicesOffered(request.getServicesOffered());
        profile.setLatitude(request.getLatitude());
        profile.setLongitude(request.getLongitude());
        profile.setAddress(request.getAddress());
        profile.setAvailability(request.getAvailability());

        ProviderProfile saved = providerProfileRepository.save(profile);

        if (!user.getRoles().contains(User.Role.ROLE_PROVIDER)) {
            user.getRoles().add(User.Role.ROLE_PROVIDER);
            userRepository.save(user);
        }

        return new ProviderProfileResponse(saved);
    }

    public ProviderProfileResponse updateProfileImage(String userEmail, String imageUrl) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Create a profile before uploading an image"));

        profile.setProfileImageUrl(imageUrl);
        return new ProviderProfileResponse(providerProfileRepository.save(profile));
    }

    public ProviderProfileResponse getMyProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("No provider profile found"));

        return new ProviderProfileResponse(profile);
    }

    public ProviderProfileResponse getProfileById(Long id) {
        ProviderProfile profile = providerProfileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Provider profile not found"));

        return new ProviderProfileResponse(profile);
    }

    public List<ProviderProfileResponse> getAllProfiles() {
        return providerProfileRepository.findAll().stream()
                .map(ProviderProfileResponse::new)
                .collect(Collectors.toList());
    }

    public List<ProviderProfileResponse> getProfilesByService(ProviderProfile.ServiceType serviceType) {
        return providerProfileRepository.findByServicesOfferedContaining(serviceType).stream()
                .map(ProviderProfileResponse::new)
                .collect(Collectors.toList());
    }
}