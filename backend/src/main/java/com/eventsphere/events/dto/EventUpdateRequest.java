package com.eventsphere.events.dto;


import java.time.LocalDateTime;
import jakarta.validation.constraints.*;

public record EventUpdateRequest(
  @NotBlank String title,
  String description,
  String mainImageUrl,
  String category,
  String venue,
  @NotNull LocalDateTime startTime,
  @NotNull LocalDateTime endTime,
  @Min(0) int totalSeats,
  @NotNull Long version
) {}