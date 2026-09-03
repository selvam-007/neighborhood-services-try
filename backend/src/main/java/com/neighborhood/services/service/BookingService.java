package com.neighborhood.services.service;

import com.neighborhood.services.dto.BookingRequest;
import com.neighborhood.services.dto.BookingResponse;
import com.neighborhood.services.entity.Booking;
import com.neighborhood.services.entity.ProviderProfile;
import com.neighborhood.services.entity.User;
import com.neighborhood.services.repository.BookingRepository;
import com.neighborhood.services.repository.ProviderProfileRepository;
import com.neighborhood.services.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            ProviderProfileRepository providerProfileRepository,
            NotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.notificationService = notificationService;
    }

    public BookingResponse createBooking(String requesterEmail, BookingRequest request) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ProviderProfile provider = providerProfileRepository.findById(request.getProviderId())
                .orElseThrow(() -> new IllegalArgumentException("Provider not found"));

        if (provider.getUser().getId().equals(requester.getId())) {
            throw new IllegalArgumentException("You cannot book your own provider profile");
        }

        Booking booking = new Booking();
        booking.setRequester(requester);
        booking.setProvider(provider);
        booking.setServiceType(request.getServiceType());
        booking.setNotes(request.getNotes());
        booking.setRequestedDate(request.getRequestedDate());
        booking.setStatus(Booking.Status.REQUESTED);

        Booking saved = bookingRepository.save(booking);

        notificationService.sendEmail(
                provider.getUser().getEmail(),
                "New Booking Request - Neighborhood Services",
                "Hi " + provider.getUser().getFullName() + ",\n\n" +
                        requester.getFullName() + " has requested your " + request.getServiceType() + " service.\n" +
                        "Notes: " + (request.getNotes() != null ? request.getNotes() : "None") + "\n\n" +
                        "Log in to accept or reject this request."
        );

        return new BookingResponse(saved);
    }

    public BookingResponse updateStatus(String userEmail, Long bookingId, Booking.Status newStatus) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        boolean isProvider = booking.getProvider().getUser().getId().equals(user.getId());
        boolean isRequester = booking.getRequester().getId().equals(user.getId());

        if (!isProvider && !isRequester) {
            throw new IllegalArgumentException("You are not part of this booking");
        }

        validateTransition(booking.getStatus(), newStatus, isProvider, isRequester);

        booking.setStatus(newStatus);
        Booking saved = bookingRepository.save(booking);

        notifyStatusChange(saved, newStatus);

        return new BookingResponse(saved);
    }

    private void notifyStatusChange(Booking booking, Booking.Status newStatus) {
        String requesterEmail = booking.getRequester().getEmail();
        String requesterName = booking.getRequester().getFullName();
        String providerName = booking.getProvider().getUser().getFullName();

        String subject;
        String body;

        switch (newStatus) {
            case ACCEPTED -> {
                subject = "Booking Accepted - Neighborhood Services";
                body = "Hi " + requesterName + ",\n\n" + providerName + " has accepted your booking request for "
                        + booking.getServiceType() + ".";
            }
            case REJECTED -> {
                subject = "Booking Declined - Neighborhood Services";
                body = "Hi " + requesterName + ",\n\n" + providerName + " was unable to accept your booking request for "
                        + booking.getServiceType() + ".";
            }
            case COMPLETED -> {
                subject = "Service Completed - Neighborhood Services";
                body = "Hi " + requesterName + ",\n\nYour " + booking.getServiceType()
                        + " service with " + providerName + " has been marked as completed. "
                        + "Log in to leave a review!";
            }
            default -> {
                return;
            }
        }

        notificationService.sendEmail(requesterEmail, subject, body);
    }

    private void validateTransition(Booking.Status current, Booking.Status next, boolean isProvider, boolean isRequester) {
        boolean allowed = switch (current) {
            case REQUESTED -> isProvider && (next == Booking.Status.ACCEPTED || next == Booking.Status.REJECTED)
                    || isRequester && next == Booking.Status.CANCELLED;
            case ACCEPTED -> isProvider && next == Booking.Status.IN_PROGRESS
                    || (isProvider || isRequester) && next == Booking.Status.CANCELLED;
            case IN_PROGRESS -> isProvider && next == Booking.Status.COMPLETED;
            default -> false;
        };

        if (!allowed) {
            throw new IllegalArgumentException(
                    "Cannot transition from " + current + " to " + next + " with your role in this booking"
            );
        }
    }

    public List<BookingResponse> getMyBookingsAsRequester(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return bookingRepository.findByRequesterId(user.getId()).stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getMyBookingsAsProvider(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ProviderProfile provider = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("No provider profile found"));

        return bookingRepository.findByProviderId(provider.getId()).stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }
}