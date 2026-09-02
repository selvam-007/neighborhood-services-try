package com.neighborhood.services.dto;

import com.neighborhood.services.entity.Review;

import java.time.Instant;

public class ReviewResponse {

    private Long id;
    private Long bookingId;
    private String reviewerName;
    private Integer rating;
    private String comment;
    private Instant createdAt;

    public ReviewResponse(Review review) {
        this.id = review.getId();
        this.bookingId = review.getBooking().getId();
        this.reviewerName = review.getReviewer().getFullName();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.createdAt = review.getCreatedAt();
    }

    public Long getId() { return id; }
    public Long getBookingId() { return bookingId; }
    public String getReviewerName() { return reviewerName; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public Instant getCreatedAt() { return createdAt; }
}