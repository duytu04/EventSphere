package com.eventsphere.events.web;


import com.eventsphere.events.dto.*;
import com.eventsphere.security.AuthFacade;

import com.eventsphere.events.model.Event;
import com.eventsphere.events.service.EventService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/organizer/events")
@PreAuthorize("hasRole('ORGANIZER')")
public class OrganizerEventsController {
  private final EventService svc;
  private final AuthFacade auth;
  public OrganizerEventsController(EventService s, AuthFacade a){ this.svc = s; this.auth = a; }

  @PostMapping
  public EventResponse create(@Valid @RequestBody EventCreateRequest req){
    Long organizerId = auth.currentUserId(); // AuthFacade của bạn đã có
    var e = svc.create(req, organizerId);
    return new EventResponse(e.getEventId(), e.getTitle(), e.getDescription(), e.getCategory(), e.getVenue(),
      e.getStartTime(), e.getEndTime(), e.getSeatsAvail(), e.getTotalSeats(), e.getStatus(), e.getVersion());
  }

  @PostMapping("/{id}/submit")
  public void submit(@PathVariable Long id){
    svc.submitForApproval(id, auth.currentUserId());
  }
}