package com.eventsphere.certificates.repo;

import com.eventsphere.attendance.model.Attendance;
import com.eventsphere.attendance.model.AttendanceMethod;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class CertificateAttendanceRepository {

  @PersistenceContext
  private EntityManager entityManager;

  public List<Attendance> findByUserIdOrderByMarkedAtDesc(Long userId) {
    TypedQuery<Attendance> query = entityManager.createQuery(
        "select a from Attendance a where a.userId = :userId order by a.markedAt desc",
        Attendance.class);
    query.setParameter("userId", userId);
    return query.getResultList();
  }

  public Optional<Attendance> findByUserIdAndEventId(Long userId, Long eventId) {
    TypedQuery<Attendance> query = entityManager.createQuery(
        "select a from Attendance a where a.userId = :userId and a.eventId = :eventId",
        Attendance.class);
    query.setParameter("userId", userId);
    query.setParameter("eventId", eventId);
    return query.getResultStream().findFirst();
  }

  public Attendance ensureRecord(Long userId, Long eventId, AttendanceMethod method) {
    return findByUserIdAndEventId(userId, eventId)
        .orElseGet(() -> save(Attendance.builder()
            .userId(userId)
            .eventId(eventId)
            .method(method)
            .markedAt(LocalDateTime.now())
            .build()));
  }

  public Attendance save(Attendance attendance) {
    if (attendance.getId() == null) {
      entityManager.persist(attendance);
      return attendance;
    }
    return entityManager.merge(attendance);
  }
}

