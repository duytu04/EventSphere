package com.eventsphere.events.repo;

import com.eventsphere.events.model.Event;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
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

  List<Event> findTop5ByStatusOrderByStartTimeAsc(String status);

  @Query("""
    SELECT e FROM Event e
    WHERE e.organizerId = :organizerId
      AND (
        :q IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%',:q,'%'))
        OR LOWER(e.category) LIKE LOWER(CONCAT('%',:q,'%'))
        OR LOWER(e.venue) LIKE LOWER(CONCAT('%',:q,'%'))
      )
      AND (:status IS NULL OR e.status = :status)
  """)
  Page<Event> searchByOrganizer(@Param("organizerId") Long organizerId,
                                @Param("q") String q,
                                @Param("status") String status,
                                Pageable pageable);
}


