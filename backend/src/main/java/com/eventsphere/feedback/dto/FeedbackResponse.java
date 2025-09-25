package com.eventsphere.feedback.dto;

import java.time.LocalDateTime;

public record FeedbackResponse(
        Long id,
        Long userId,
        Long eventId,
        int rating,
        String comment,
        LocalDateTime createdAt
) {}
