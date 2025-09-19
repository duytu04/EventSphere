// package com.eventsphere.events.dto;

// import java.time.LocalDateTime;

// public record EventResponse(
//     Long eventId,
//     String title,
//     String description,
//     String category,
//     String venue,
//     LocalDateTime startTime,
//     LocalDateTime endTime,
//     Integer seatsAvail,
//     Integer totalSeats,
//     String status,
//     Long version
// ) {}



// src/main/java/com/eventsphere/events/dto/EventResponse.java
package com.eventsphere.events.dto;

import java.time.LocalDateTime;

public record EventResponse(
    Long id,                 // Entity: id
    String name,             // Entity: title
    String description,
    String category,
    String location,         // Entity: venue
    LocalDateTime startTime,
    LocalDateTime endTime,
    Integer seatsAvailable,  // Entity: seatsAvail
    Integer capacity,        // Entity: totalSeats
    String status,
    Long version
) {}
