package com.eventsphere.feedback.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="feedback",
       uniqueConstraints = @UniqueConstraint(name="uk_feedback_user_event", columnNames = {"user_id","event_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Feedback {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", nullable = false)
    private Long userId;

    @Column(name="event_id", nullable = false)
    private Long eventId;

    @Column(nullable = false)
    private int rating; // 1..5

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name="created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
