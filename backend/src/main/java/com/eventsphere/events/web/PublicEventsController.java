

// src/main/java/com/eventsphere/events/web/PublicEventsController.java
package com.eventsphere.events.web;

import com.eventsphere.core.util.PagedResponse;
import com.eventsphere.events.dto.EventResponse;
import com.eventsphere.events.model.Event;
import com.eventsphere.events.service.EventService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class PublicEventsController {
  private final EventService svc;
  public PublicEventsController(EventService s){ this.svc = s; }

  @GetMapping
  public PagedResponse<EventResponse> list(
      @RequestParam(defaultValue = "") String q,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ){
    Page<Event> p = svc.search(q, "APPROVED", page, size);
    var mapped = p.map(PublicEventsController::map);
    return PagedResponse.from(mapped);
  }

  @GetMapping("/{id}")
  public EventResponse detail(@PathVariable Long id){
    var e = svc.get(id);
    return map(e);
  }

  /* mapper: Entity -> FE DTO */
  private static EventResponse map(Event e){
    return new EventResponse(
      e.getEventId(),                 // id
      e.getTitle(),              // name
      e.getDescription(),
      e.getMainImageUrl(),      // 🔥 thêm: map đúng
      e.getCategory(),
      e.getVenue(),              // location
      e.getStartTime(),
      e.getEndTime(),
      e.getSeatsAvail(),         // seatsAvailable
      e.getTotalSeats(),         // capacity
      e.getStatus(),
      e.getVersion()
    );
  }
}
