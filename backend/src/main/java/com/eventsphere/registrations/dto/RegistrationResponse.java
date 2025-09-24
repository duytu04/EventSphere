package com.eventsphere.registrations.dto;

import java.time.LocalDateTime;

public record RegistrationResponse(
    Long id,
    Long eventId,
    String eventTitle,
    LocalDateTime eventStartTime,
    LocalDateTime eventEndTime,
    String eventVenue,
    Integer capacity,
    Integer seatsAvailable,
    String status,
    LocalDateTime registeredAt,
    Long userId,
    String userName,
    String userEmail
) {}
