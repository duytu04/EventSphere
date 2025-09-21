
package com.eventsphere.events.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long eventId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "main_image_url", length = 512)
    private String mainImageUrl;
    private String category;

    @Column(length = 200)
    private String venue;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Builder.Default
    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats = 0;

    @Builder.Default
    @Column(name = "seats_avail", nullable = false)
    private Integer seatsAvail = 0;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "DRAFT"; // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED

    @Column(name = "organizer_id")
    private Long organizerId;

    @Builder.Default
    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (seatsAvail == null) {
            seatsAvail = (totalSeats != null ? totalSeats : 0);
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
