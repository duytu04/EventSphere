package com.eventsphere.registrations.dto;

import com.eventsphere.registrations.model.RegistrationStatus;

import java.time.LocalDateTime;

public record RegistrationResponse(
        Long id,
        Long eventId,
        String eventName,
        String eventLocation,
        LocalDateTime eventStartTime,
        LocalDateTime eventEndTime,
        String eventImageUrl,
        RegistrationStatus status,
        LocalDateTime registeredAt,
        String qrCode,
        Boolean isScanned
) {}