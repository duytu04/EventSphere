


package com.eventsphere.events.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "events")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Event {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "event_id")
  private Long eventId; // giữ tên cũ

  @Column(name = "title", nullable = false, length = 200)
  private String title; // map vào cột title

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(name = "main_image_url", length = 512)
  private String mainImageUrl;

  @Column(length = 60)
  private String category;

  @Column(name = "venue", length = 200)
  private String venue; // map vào cột venue

  @Column(name = "start_time", nullable = false)
  private LocalDateTime startTime;

  @Column(name = "end_time", nullable = false)
  private LocalDateTime endTime;

  @Builder.Default
  @Column(name = "total_seats", nullable = false)
  private Integer totalSeats = 0; // map vào cột total_seats

  @Builder.Default
  @Column(name = "seats_avail", nullable = false)
  private Integer seatsAvail = 0; // map vào cột seats_avail

  @Builder.Default
  @Column(nullable = false, length = 30)
  private String status = "DRAFT";

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
    if (seatsAvail == null) seatsAvail = (totalSeats != null ? totalSeats : 0);
    clampSeats();
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = LocalDateTime.now();
    clampSeats();
  }

  private void clampSeats() {
    int cap = totalSeats != null ? Math.max(0, totalSeats) : 0;
    int avail = seatsAvail != null ? Math.max(0, seatsAvail) : cap;
    if (avail > cap) avail = cap;
    totalSeats = cap;
    seatsAvail = avail;
  }
}
