

// src/main/java/com/eventsphere/events/web/PublicEventsController.java
package com.eventsphere.events.web;

import com.eventsphere.core.util.PagedResponse;
import com.eventsphere.events.dto.EventResponse;
import com.eventsphere.events.dto.EventUpdateRequest;
import com.eventsphere.events.model.Event;
import com.eventsphere.events.repo.EventRepository;
import com.eventsphere.events.service.EventService;
import com.eventsphere.registrations.dto.RegistrationResponse;
import com.eventsphere.registrations.model.Registration;
import com.eventsphere.registrations.model.RegistrationStatus;
import com.eventsphere.registrations.repo.RegistrationRepository;
import com.eventsphere.security.AuthFacade;
import com.eventsphere.users.repo.UserRepository;
import com.eventsphere.core.exception.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class PublicEventsController {
  private final EventService svc;
  private final EventRepository eventRepo;
  private final RegistrationRepository registrationRepo;
  private final UserRepository users;
  private final AuthFacade auth;

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

  @PostMapping("/{id}/register")
  public ResponseEntity<RegistrationResponse> register(@PathVariable Long id) {
    Long userId = auth.currentUserId();
    
    // Kiểm tra event tồn tại và đã được approve
    Event event = svc.get(id);
    if (!"APPROVED".equals(event.getStatus())) {
      throw new BadRequestException("Event is not available for registration");
    }
    
    // Kiểm tra đã đăng ký chưa
    if (registrationRepo.existsByUser_UserIdAndEvent_EventId(userId, id)) {
      throw new BadRequestException("You have already registered for this event");
    }
    
    // Kiểm tra còn chỗ không
    if (event.getSeatsAvail() <= 0) {
      throw new BadRequestException("Event is full");
    }
    
    // Tạo registration - cần lấy User entity từ userId
    var user = users.findById(userId)
        .orElseThrow(() -> new BadRequestException("User not found"));
    
    Registration registration = Registration.builder()
        .user(user)
        .event(event)
        .status(RegistrationStatus.CONFIRMED)
        .build();
    
    registration = registrationRepo.save(registration);
    
    // Cập nhật số chỗ còn lại
    event.setSeatsAvail(event.getSeatsAvail() - 1);
    eventRepo.save(event);
    
    return ResponseEntity.ok(new RegistrationResponse(
        registration.getId(),
        event.getEventId(),
        event.getTitle(),
        event.getVenue(),
        event.getStartTime(),
        event.getEndTime(),
        registration.getStatus(),
        registration.getRegisteredAt(),
        null,
        false
    ));
  }

  /* mapper: Entity -> FE DTO */
private static EventResponse map(Event e) {
  int total = e.getTotalSeats() != null ? e.getTotalSeats() : 0;
  int available = e.getSeatsAvail() != null ? e.getSeatsAvail() : total;
  long attendeesCount = Math.max(0, total - available);
  return new EventResponse(
      e.getEventId(),       // id
      e.getTitle(),         // name
      e.getDescription(),
      e.getCategory(),
      e.getVenue(),         // location
      e.getMainImageUrl(),  // mainImageUrl (thứ tự #6)
      e.getStartTime(),
      e.getEndTime(),
      e.getSeatsAvail(),    // seatsAvailable
      e.getTotalSeats(),    // capacity
      e.getStatus(),
      e.getVersion(),
      attendeesCount
  );
}

}
