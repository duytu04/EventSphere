package com.eventsphere.attendance.repo;

import com.eventsphere.attendance.model.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
    Optional<Attendance> findByUserIdAndEventId(Long userId, Long eventId);
    Page<Attendance> findByEventIdOrderByMarkedAtDesc(Long eventId, Pageable pageable);
}
