package com.eventsphere.admin.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record AdminMetricsResponse(
    Kpis kpis,
    List<PendingEventSummary> pendingEvents,
    List<RecentRegistration> recentRegistrations,
    List<CapacityHotspot> capacityHotspots,
    NotificationStats notificationStats,
    Instant lastUpdated
) {
  public record Kpis(
      long usersTotal,
      Map<String, Long> usersByRole,
      long eventsTotal,
      Map<String, Long> eventsByStatus,
      long registrationsTotal,
      long attendanceTotal,
      double capacityUtilizationPct
  ) {}

  public record PendingEventSummary(
      long id,
      String name,
      String organizerName,
      Instant startTime,
      int capacity
  ) {}

  public record RecentRegistration(
      long id,
      long eventId,
      String eventName,
      String studentEmail,
      Instant registeredOn
  ) {}

  public record CapacityHotspot(
      long eventId,
      String eventName,
      int capacity,
      int seatsAvailable
  ) {}

  public record NotificationStats(
      long totalUnread,
      long editRequestUnread,
      long approvalRequestUnread,
      long userRegistrationUnread,
      long systemAlertUnread
  ) {}
}
