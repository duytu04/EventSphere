



package com.eventsphere.events.dto;

import java.time.LocalDateTime;

public record EventResponse(
  Long id,
  String name,
  String description,
  String category,
  String location,
  String mainImageUrl,
  java.time.LocalDateTime startTime,
  java.time.LocalDateTime endTime,
  Integer seatsAvailable,
  Integer capacity,
  String status,
  Long version,
  long attendeesCount
) {}
