// src/main/java/com/eventsphere/events/repo/EventRepository.java
package com.eventsphere.events.repo;

import com.eventsphere.events.model.Event;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param; // <-- import này

public interface EventRepository extends JpaRepository<Event, Long> {
  @Query("""
    SELECT e FROM Event e
    WHERE (:q IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(e.category) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(e.venue) LIKE LOWER(CONCAT('%',:q,'%')) )
      AND (:status IS NULL OR e.status = :status)
  """)
  Page<Event> search(@Param("q") String q,
                     @Param("status") String status,
                     Pageable pageable);

  long countByStatus(String status);
}
