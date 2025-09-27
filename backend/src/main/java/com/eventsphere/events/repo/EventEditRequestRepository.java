package com.eventsphere.events.repo;

import com.eventsphere.events.model.EventEditRequest;
import com.eventsphere.events.model.EventEditRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventEditRequestRepository extends JpaRepository<EventEditRequest, Long> {
    
    List<EventEditRequest> findByStatusOrderByCreatedAtDesc(EventEditRequestStatus status);
    
    List<EventEditRequest> findByEvent_EventIdOrderByCreatedAtDesc(Long eventId);
    
    List<EventEditRequest> findByRequester_UserIdOrderByCreatedAtDesc(Long requesterId);
    
    @Query("SELECT COUNT(e) FROM EventEditRequest e WHERE e.status = 'PENDING'")
    long countPendingRequests();
}

