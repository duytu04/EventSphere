
package com.eventsphere.events.dto;

import java.time.LocalDateTime;

public record EventResponse(
        Long id, // Entity: id
        String name, // Entity: title
        String description,
        String mainImageUrl,
        String category,
        String location, // Entity: venue
        LocalDateTime startTime,
        LocalDateTime endTime,
        Integer seatsAvailable, // Entity: seatsAvail
        Integer capacity, // Entity: totalSeats
        String status,
        Long version
        ) {

}
