package com.neighborhood.services.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "provider_profiles")
public class ProviderProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 1000)
    private String bio;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "provider_services", joinColumns = @JoinColumn(name = "provider_id"))
    @Column(name = "service_type")
    @Enumerated(EnumType.STRING)
    private Set<ServiceType> servicesOffered = new HashSet<>();

    private Double latitude;
    private Double longitude;
    private String address;

    private String availability;

    private String profileImageUrl;

    @Column(nullable = false)
    private boolean verified = false;

    private Double averageRating = 0.0;

    private Integer totalReviews = 0;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public enum ServiceType {
        TUTORING,
        PLUMBING,
        TAILORING,
        COOKING,
        REPAIRS,
        ELECTRICAL,
        CLEANING,
        GARDENING
    }

    // --- Getters and setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Set<ServiceType> getServicesOffered() { return servicesOffered; }
    public void setServicesOffered(Set<ServiceType> servicesOffered) { this.servicesOffered = servicesOffered; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }

    public Instant getCreatedAt() { return createdAt; }
}