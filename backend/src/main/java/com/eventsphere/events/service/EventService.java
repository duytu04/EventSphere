

package com.eventsphere.events.service;

import com.eventsphere.events.dto.*;
import com.eventsphere.events.model.Event;
import org.springframework.data.domain.Page;

public interface EventService {
  Event create(EventCreateRequest req, Long organizerId);
  Event update(Long id, EventUpdateRequest req);
  void delete(Long id);

  void submitForApproval(Long id, Long organizerId);
  void approve(Long id);
  void reject(Long id);

  Page<Event> search(String q, String status, int page, int size);
  Page<Event> searchByOrganizer(Long organizerId, String q, String status, int page, int size);
  Event getOwned(Long id, Long organizerId);
  Event updateForOrganizer(Long id, EventUpdateRequest req, Long organizerId);
  Event get(Long id);

  // --- thêm để giữ tên cũ ---
  Event getAdminEventById(Long id);

  EventStatsResponse stats();
}



