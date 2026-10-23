package com.neighborhood.services.dto;

import com.neighborhood.services.entity.ProviderProfile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.Set;

public class ProviderProfileRequest {

    @NotBlank(message = "Bio is required")
    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;

    @NotEmpty(message = "At least one service must be selected")
    private Set<ProviderProfile.ServiceType> servicesOffered;

    private Double latitude;
    private Double longitude;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 255, message = "Availability must not exceed 255 characters")
    private String availability;

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Set<ProviderProfile.ServiceType> getServicesOffered() { return servicesOffered; }
    public void setServicesOffered(Set<ProviderProfile.ServiceType> servicesOffered) { this.servicesOffered = servicesOffered; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }
}