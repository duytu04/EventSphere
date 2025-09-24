package com.eventsphere.registrations.web;

import com.eventsphere.registrations.dto.RegistrationResponse;
import com.eventsphere.registrations.service.RegistrationService;
import com.eventsphere.security.AuthFacade;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequiredArgsConstructor
@RequestMapping
public class RegistrationsController {

  private final RegistrationService registrations;
  private final AuthFacade auth;

  @PostMapping("/api/events/{eventId}/register")
  @PreAuthorize("isAuthenticated()")
  public RegistrationResponse register(@PathVariable Long eventId) {
    Long userId = requireCurrentUser();
    return registrations.register(eventId, userId);
  }

  @GetMapping("/api/me/registrations")
  @PreAuthorize("isAuthenticated()")
  public List<RegistrationResponse> myRegistrations() {
    Long userId = requireCurrentUser();
    return registrations.listForUser(userId);
  }

  @DeleteMapping("/api/me/registrations/{registrationId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Void> cancel(@PathVariable Long registrationId) {
    Long userId = requireCurrentUser();
    registrations.cancel(registrationId, userId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/api/admin/events/{eventId}/registrations")
  @PreAuthorize("hasRole('ADMIN')")
  public List<RegistrationResponse> registrationsForEvent(@PathVariable Long eventId) {
    return registrations.listForEvent(eventId);
  }

  @GetMapping("/api/admin/events/{eventId}/registrations/export")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<byte[]> exportRegistrations(@PathVariable Long eventId) {
    byte[] csv = registrations.exportCsv(eventId);
    String filename = "event-" + eventId + "-registrations.csv";
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(csv);
  }

  private Long requireCurrentUser() {
    Long userId = auth.currentUserId();
    if (userId == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để tiếp tục.");
    }
    return userId;
  }
}
