package com.eventsphere.registrations.model;

import com.eventsphere.events.model.Event;
import com.eventsphere.users.model.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "registrations",
    uniqueConstraints = @UniqueConstraint(name = "uk_registrations_user_event", columnNames = {"user_id", "event_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "event_id", nullable = false)
  private Event event;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private RegistrationStatus status;

  @Column(name = "registered_at", nullable = false)
  private LocalDateTime registeredAt;

  @PrePersist
  void onCreate() {
    if (registeredAt == null) {
      registeredAt = LocalDateTime.now();
    }
    if (status == null) {
      status = RegistrationStatus.CONFIRMED;
    }
  }
}
