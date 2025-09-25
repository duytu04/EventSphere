package com.eventsphere.feedback.repo;

import com.eventsphere.feedback.model.Feedback;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByEventIdOrderByCreatedAtDesc(Long eventId, Pageable pageable);

    @Query("SELECT COALESCE(AVG(f.rating),0) FROM Feedback f WHERE f.eventId = :eventId")
    double avgRatingByEventId(Long eventId);

    List<Feedback> findTopByOrderByCreatedAtDesc(Pageable pageable);
}
