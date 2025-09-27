package com.eventsphere.events.dto;

import com.eventsphere.events.model.EventEditRequestStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class EventEditRequestDtos {

    public record EventEditRequestResponse(
        Long id,
        Long eventId,
        String eventName,
        Long requesterId,
        String requesterName,
        String requesterEmail,
        String originalData,
        String requestedData,
        EventEditRequestStatus status,
        String adminNotes,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime updatedAt,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime processedAt,
        Long processedById,
        String processedByName
    ) {}

    public record CreateEventEditRequestRequest(
        Long eventId,
        String requestedData
    ) {}

    public record ProcessEventEditRequestRequest(
        EventEditRequestStatus status,
        String adminNotes
    ) {}
}

