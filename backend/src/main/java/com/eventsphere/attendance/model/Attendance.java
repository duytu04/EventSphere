package com.eventsphere.attendance.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance",
       uniqueConstraints = @UniqueConstraint(name = "uk_attendance_user_event", columnNames = {"user_id","event_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Attendance {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", nullable = false)
    private Long userId;

    @Column(name="event_id", nullable = false)
    private Long eventId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private AttendanceMethod method;

    @Column(name="marked_at", nullable = false)
    private LocalDateTime markedAt;

    @PrePersist
    void onCreate() {
        if (markedAt == null) markedAt = LocalDateTime.now();
    }
}