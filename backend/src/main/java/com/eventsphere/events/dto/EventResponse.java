package com.eventsphere.events.dto;

import java.time.LocalDateTime;

public record EventResponse(
    Long eventId,
    String title,
    String description,
    String category,
    String venue,
    LocalDateTime startTime,
    LocalDateTime endTime,
    Integer seatsAvail,
    Integer totalSeats,
    String status,
    Long version
) {}
