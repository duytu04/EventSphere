// package com.eventsphere.events.dto;

// import java.time.LocalDateTime;
// import jakarta.validation.constraints.*;

// public record EventCreateRequest(
//     @NotBlank String title,
//     String description,
//     String category,
//     String venue,
//     @NotNull LocalDateTime startTime,
//     @NotNull LocalDateTime endTime,
//     @Min(0) int totalSeats
// ) {}



// src/main/java/com/eventsphere/events/dto/EventCreateRequest.java
package com.eventsphere.events.dto;

import java.time.LocalDateTime;
import jakarta.validation.constraints.*;

public record EventCreateRequest(
    @NotBlank String name,         // FE: name  -> Entity: title
    String description,
    String category,
    String location,               // FE: location -> Entity: venue
    @NotNull LocalDateTime startTime,
    @NotNull LocalDateTime endTime,
    @Min(0) Integer capacity       // FE: capacity -> Entity: totalSeats
) {}


