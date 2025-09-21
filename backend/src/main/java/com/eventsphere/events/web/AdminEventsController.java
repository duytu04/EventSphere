

package com.eventsphere.events.web;

import com.eventsphere.events.dto.EventCreateRequest;
import com.eventsphere.events.dto.EventResponse;
import com.eventsphere.events.dto.EventUpdateRequest;
import com.eventsphere.events.model.Event;
import com.eventsphere.events.service.EventService;
import com.eventsphere.core.util.PagedResponse;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/events")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEventsController {

  private final EventService svc;

  public AdminEventsController(EventService s) {
    this.svc = s;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public EventResponse create(@Valid @RequestBody EventCreateRequest req) {
    var e = svc.create(req, null); // organizerId: null (có thể lấy từ AuthFacade nếu cần)
    return map(e);
  }

  @PutMapping("/{id}")
  public EventResponse update(@PathVariable Long id, @Valid @RequestBody EventUpdateRequest req) {
    var e = svc.update(id, req);
    return map(e);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    svc.delete(id);
  }

  @PostMapping("/{id}/approve")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void approve(@PathVariable Long id) {
    svc.approve(id);
  }

  @PostMapping("/{id}/reject")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void reject(@PathVariable Long id) {
    svc.reject(id);
  }

@GetMapping
public PagedResponse<EventResponse> list(
    @RequestParam(required = false) String q,
    @RequestParam(required = false) String status,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size
) {
  var result = svc.search(q, status, page, size);
  var mapped = result.map(AdminEventsController::map);
  return PagedResponse.from(mapped); // ✅ dùng from
}

  /* --------- mapper --------- */
  private static EventResponse map(Event e) {
    return new EventResponse(
        e.getEventId(),
        e.getTitle(),
        e.getDescription(),
        e.getMainImageUrl(),
        e.getCategory(),
        e.getVenue(),
        e.getStartTime(),
        e.getEndTime(),
        e.getSeatsAvail(),
        e.getTotalSeats(),
        e.getStatus(),
        e.getVersion()
    );
  }
}


