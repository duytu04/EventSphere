package com.eventsphere.feedback.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record FeedbackCreateRequest(
        @NotNull Long eventId,
        @Min(1) @Max(5) int rating,
        String comment
) {}
