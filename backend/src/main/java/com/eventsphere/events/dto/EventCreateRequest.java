



// src/main/java/com/eventsphere/events/dto/EventCreateRequest.java
package com.eventsphere.events.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record EventCreateRequest(
    @NotBlank
    @JsonAlias("name")                  // FE gửi "name" -> BE đọc title()
    String title,                       // service dùng title()

    String description,

    String category,

    @JsonAlias("location")              // FE gửi "location" -> BE đọc venue()
    String venue,                       // service dùng venue()

    @NotNull LocalDateTime startTime,
    @NotNull LocalDateTime endTime,

    @Min(0)
    @JsonAlias("capacity")              // FE gửi "capacity" -> BE đọc totalSeats()
    Integer totalSeats,                 // service dùng totalSeats()

    @Min(0)
    @JsonAlias("seatsAvailable")        // FE gửi "seatsAvailable" -> BE đọc seatsAvail()
    Integer seatsAvail,                 // service dùng seatsAvail()

    @Size(max = 512, message = "Đường dẫn ảnh quá dài (tối đa 512 ký tự)") // khớp DB (VARCHAR(512))
    @JsonAlias({"mainImageUrl","main_image_url"})
    String mainImageUrl
) {}
