package com.neighborhood.services.service;

import com.neighborhood.services.dto.ReviewRequest;
import com.neighborhood.services.dto.ReviewResponse;
import com.neighborhood.services.entity.Booking;
import com.neighborhood.services.entity.ProviderProfile;
import com.neighborhood.services.entity.Review;
import com.neighborhood.services.entity.User;
import com.neighborhood.services.repository.BookingRepository;
import com.neighborhood.services.repository.ProviderProfileRepository;
import com.neighborhood.services.repository.ReviewRepository;
import com.neighborhood.services.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository,
            ProviderProfileRepository providerProfileRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
    }

    public ReviewResponse createReview(String reviewerEmail, ReviewRequest request) {
        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getRequester().getId().equals(reviewer.getId())) {
            throw new IllegalArgumentException("Only the requester can review this booking");
        }

        if (booking.getStatus() != Booking.Status.COMPLETED) {
            throw new IllegalArgumentException("You can only review a completed booking");
        }

        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new IllegalArgumentException("This booking has already been reviewed");
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setReviewer(reviewer);
        review.setProvider(booking.getProvider());
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);

        recalculateProviderRating(booking.getProvider());

        return new ReviewResponse(saved);
    }

    private void recalculateProviderRating(ProviderProfile provider) {
        List<Review> allReviews = reviewRepository.findByProviderIdOrderByCreatedAtDesc(provider.getId());

        double average = allReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        provider.setAverageRating(Math.round(average * 10.0) / 10.0);
        provider.setTotalReviews(allReviews.size());
        providerProfileRepository.save(provider);
    }

    public List<ReviewResponse> getReviewsForProvider(Long providerId) {
        return reviewRepository.findByProviderIdOrderByCreatedAtDesc(providerId).stream()
                .map(ReviewResponse::new)
                .collect(Collectors.toList());
    }

    public boolean hasReview(Long bookingId) {
        return reviewRepository.existsByBookingId(bookingId);
    }
}