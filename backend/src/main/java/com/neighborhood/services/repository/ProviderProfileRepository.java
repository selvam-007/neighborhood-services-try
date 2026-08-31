package com.neighborhood.services.repository;

import com.neighborhood.services.entity.ProviderProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {
    Optional<ProviderProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    List<ProviderProfile> findByServicesOfferedContaining(ProviderProfile.ServiceType serviceType);
}