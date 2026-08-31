package com.neighborhood.services.dto;

import com.neighborhood.services.entity.ProviderProfile;

import java.util.Set;

public class ProviderProfileResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String bio;
    private Set<ProviderProfile.ServiceType> servicesOffered;
    private Double latitude;
    private Double longitude;
    private String address;
    private String availability;
    private String profileImageUrl;
    private boolean verified;
    private Double averageRating;
    private Integer totalReviews;

    public ProviderProfileResponse(ProviderProfile profile) {
        this.id = profile.getId();
        this.userId = profile.getUser().getId();
        this.fullName = profile.getUser().getFullName();
        this.bio = profile.getBio();
        this.servicesOffered = profile.getServicesOffered();
        this.latitude = profile.getLatitude();
        this.longitude = profile.getLongitude();
        this.address = profile.getAddress();
        this.availability = profile.getAvailability();
        this.profileImageUrl = profile.getProfileImageUrl();
        this.verified = profile.isVerified();
        this.averageRating = profile.getAverageRating();
        this.totalReviews = profile.getTotalReviews();
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getBio() { return bio; }
    public Set<ProviderProfile.ServiceType> getServicesOffered() { return servicesOffered; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getAddress() { return address; }
    public String getAvailability() { return availability; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public boolean isVerified() { return verified; }
    public Double getAverageRating() { return averageRating; }
    public Integer getTotalReviews() { return totalReviews; }
}