package com.neighborhood.services.dto;

public class AdminStatsResponse {

    private long totalUsers;
    private long totalProviders;
    private long verifiedProviders;
    private long totalBookings;
    private long completedBookings;
    private long activeBookings;
    private long cancelledOrRejectedBookings;

    public AdminStatsResponse(
            long totalUsers, long totalProviders, long verifiedProviders,
            long totalBookings, long completedBookings, long activeBookings,
            long cancelledOrRejectedBookings
    ) {
        this.totalUsers = totalUsers;
        this.totalProviders = totalProviders;
        this.verifiedProviders = verifiedProviders;
        this.totalBookings = totalBookings;
        this.completedBookings = completedBookings;
        this.activeBookings = activeBookings;
        this.cancelledOrRejectedBookings = cancelledOrRejectedBookings;
    }

    public long getTotalUsers() { return totalUsers; }
    public long getTotalProviders() { return totalProviders; }
    public long getVerifiedProviders() { return verifiedProviders; }
    public long getTotalBookings() { return totalBookings; }
    public long getCompletedBookings() { return completedBookings; }
    public long getActiveBookings() { return activeBookings; }
    public long getCancelledOrRejectedBookings() { return cancelledOrRejectedBookings; }
}