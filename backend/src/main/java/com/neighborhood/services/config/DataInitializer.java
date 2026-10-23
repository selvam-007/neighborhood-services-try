package com.neighborhood.services.config;

import com.neighborhood.services.entity.ProviderProfile;
import com.neighborhood.services.entity.User;
import com.neighborhood.services.repository.ProviderProfileRepository;
import com.neighborhood.services.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-demo-data:true}")
    private boolean seedDemoData;

    public DataInitializer(
            UserRepository userRepository,
            ProviderProfileRepository providerProfileRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed default Admin if not present
        if (!userRepository.existsByEmail("admin@neighborlink.com")) {
            User admin = new User();
            admin.setEmail("admin@neighborlink.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Platform Admin");
            admin.setPhoneNumber("+91 99999 00000");
            admin.setRoles(Set.of(User.Role.ROLE_USER, User.Role.ROLE_ADMIN));
            userRepository.save(admin);
            System.out.println(">>> Initialized default Admin user: admin@neighborlink.com / admin123");
        }

        // 2. Seed initial sample providers if empty and demo seeding is enabled
        if (seedDemoData && providerProfileRepository.count() == 0) {
            seedProvider(
                    "ramesh.plumber@example.com",
                    "Ramesh Kumar",
                    "+91 98401 23456",
                    "Certified master plumber with 10+ years experience in fixing residential leaks, tap replacements, geysers, and emergency pipe clogs.",
                    Set.of(ProviderProfile.ServiceType.PLUMBING, ProviderProfile.ServiceType.REPAIRS),
                    13.0067,
                    80.2206,
                    "Anna Nagar, 2nd Main Road",
                    "Mon-Sat 8:00 AM - 7:00 PM",
                    true,
                    0.0,
                    0
            );

            seedProvider(
                    "priya.tutor@example.com",
                    "Priya Sharma",
                    "+91 98402 34567",
                    "Experienced high school mathematics and physics educator. Helping students build core concepts and excel in board exams.",
                    Set.of(ProviderProfile.ServiceType.TUTORING),
                    13.0405,
                    80.2337,
                    "T. Nagar, Near Panagal Park",
                    "Weekdays 4:00 PM - 8:00 PM",
                    true,
                    0.0,
                    0
            );

            seedProvider(
                    "arun.electric@example.com",
                    "Arun Patel",
                    "+91 98403 45678",
                    "Licensed wireman and electrician. Circuit troubleshooting, ceiling fans, inverter wiring, and smart home lighting installations.",
                    Set.of(ProviderProfile.ServiceType.ELECTRICAL, ProviderProfile.ServiceType.REPAIRS),
                    12.9801,
                    80.2184,
                    "Velachery Main Road",
                    "All Days 9:00 AM - 8:00 PM",
                    true,
                    0.0,
                    0
            );

            seedProvider(
                    "sunita.clean@example.com",
                    "Sunita Rao",
                    "+91 98404 56789",
                    "Deep cleaning and sanitation specialist for apartments and individual villas. Reliable, safe, and thorough service.",
                    Set.of(ProviderProfile.ServiceType.CLEANING, ProviderProfile.ServiceType.COOKING),
                    13.0827,
                    80.2707,
                    "Kilpauk Garden Colony",
                    "Mon-Fri 7:00 AM - 4:00 PM",
                    true,
                    0.0,
                    0
            );

            System.out.println(">>> Initialized 4 verified neighborhood service providers with reset ratings.");
        }
    }

    private void seedProvider(
            String email,
            String fullName,
            String phone,
            String bio,
            Set<ProviderProfile.ServiceType> services,
            Double lat,
            Double lng,
            String address,
            String availability,
            boolean verified,
            Double rating,
            int reviewCount
    ) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setPassword(passwordEncoder.encode("provider123"));
            u.setFullName(fullName);
            u.setPhoneNumber(phone);
            u.setRoles(Set.of(User.Role.ROLE_USER, User.Role.ROLE_PROVIDER));
            return userRepository.save(u);
        });

        ProviderProfile profile = new ProviderProfile();
        profile.setUser(user);
        profile.setBio(bio);
        profile.setServicesOffered(services);
        profile.setLatitude(lat);
        profile.setLongitude(lng);
        profile.setAddress(address);
        profile.setAvailability(availability);
        profile.setVerified(verified);
        profile.setAverageRating(rating);
        profile.setTotalReviews(reviewCount);
        providerProfileRepository.save(profile);
    }
}
