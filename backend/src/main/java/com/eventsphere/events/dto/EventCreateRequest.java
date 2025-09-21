

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
    @Min(0) Integer capacity ,      // FE: capacity -> Entity: totalSeats
    @Size(max = 2048, message = "Đường dẫn ảnh quá dài (tối đa 2048 ký tự)")
     String mainImageUrl            // 🔥 thêm: map -> Event.mainImageUrl
) {}


