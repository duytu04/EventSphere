package com.eventsphere.registrations.repo;

import com.eventsphere.registrations.model.Registration;
import com.eventsphere.registrations.model.RegistrationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

  boolean existsByUser_UserIdAndEvent_EventId(Long userId, Long eventId);

  Optional<Registration> findByIdAndUser_UserId(Long id, Long userId);

  @EntityGraph(attributePaths = {"event", "user"})
  List<Registration> findByUser_UserIdOrderByRegisteredAtDesc(Long userId);

  @EntityGraph(attributePaths = {"event", "user"})
  List<Registration> findByEvent_EventIdOrderByRegisteredAtAsc(Long eventId);

  long countByEvent_EventIdAndStatus(Long eventId, RegistrationStatus status);
  
  Optional<Registration> findByUser_UserIdAndEvent_EventId(Long userId, Long eventId);
}
