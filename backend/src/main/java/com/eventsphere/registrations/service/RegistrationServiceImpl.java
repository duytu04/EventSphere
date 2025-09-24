package com.eventsphere.registrations.service;

import com.eventsphere.core.exception.NotFoundException;
import com.eventsphere.events.model.ApprovalStatus;
import com.eventsphere.events.model.Event;
import com.eventsphere.events.repo.EventRepository;
import com.eventsphere.registrations.dto.RegistrationResponse;
import com.eventsphere.registrations.model.Registration;
import com.eventsphere.registrations.model.RegistrationStatus;
import com.eventsphere.registrations.repo.RegistrationRepository;
import com.eventsphere.users.model.User;
import com.eventsphere.users.repo.UserRepository;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class RegistrationServiceImpl implements RegistrationService {

  private static final DateTimeFormatter CSV_TIME_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

  private final RegistrationRepository registrations;
  private final EventRepository events;
  private final UserRepository users;

  @Override
  public RegistrationResponse register(Long eventId, Long userId) {
    Event event = requireEvent(eventId);
    User user = requireUser(userId);

    if (!Objects.equals(event.getStatus(), ApprovalStatus.APPROVED.name())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sự kiện chưa được mở đăng ký.");
    }

    if (registrations.existsByUser_UserIdAndEvent_EventId(userId, eventId)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã đăng ký sự kiện này.");
    }

    int capacity = valueOrZero(event.getTotalSeats());
    int seatsAvailable = event.getSeatsAvail() != null ? event.getSeatsAvail() : capacity;

    if (capacity > 0 && seatsAvailable <= 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sự kiện đã đầy.");
    }

    RegistrationStatus status = RegistrationStatus.CONFIRMED;

    if (status == RegistrationStatus.CONFIRMED && capacity > 0) {
      event.setSeatsAvail(Math.max(0, seatsAvailable - 1));
    }

    Registration saved = registrations.save(
        Registration.builder()
            .event(event)
            .user(user)
            .status(status)
            .registeredAt(LocalDateTime.now())
            .build()
    );

    return map(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public List<RegistrationResponse> listForUser(Long userId) {
    requireUser(userId); // ensure 404 if user is missing
    return registrations.findByUser_UserIdOrderByRegisteredAtDesc(userId)
        .stream()
        .map(this::map)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<RegistrationResponse> listForEvent(Long eventId) {
    requireEvent(eventId);
    return registrations.findByEvent_EventIdOrderByRegisteredAtAsc(eventId)
        .stream()
        .map(this::map)
        .toList();
  }

  @Override
  public void cancel(Long registrationId, Long userId) {
    Registration registration = registrations.findByIdAndUser_UserId(registrationId, userId)
        .orElseThrow(() -> new NotFoundException("Không tìm thấy đăng ký."));

    Event event = registration.getEvent();
    if (registration.getStatus() == RegistrationStatus.CONFIRMED && event != null) {
      int total = valueOrZero(event.getTotalSeats());
      if (total > 0) {
        int seatsAvailable = event.getSeatsAvail() != null ? event.getSeatsAvail() : 0;
        int updated = Math.min(total, Math.max(0, seatsAvailable + 1));
        event.setSeatsAvail(updated);
      }
    }

    registrations.delete(registration);
  }

  @Override
  @Transactional(readOnly = true)
  public byte[] exportCsv(Long eventId) {
    Event event = requireEvent(eventId);
    List<Registration> rows = registrations.findByEvent_EventIdOrderByRegisteredAtAsc(eventId);

    StringBuilder sb = new StringBuilder();
    sb.append("RegistrationId,EventId,EventTitle,UserId,UserName,UserEmail,Status,RegisteredAt\n");

    for (Registration registration : rows) {
      User user = registration.getUser();
      sb.append(registration.getId()).append(',');
      sb.append(event.getEventId()).append(',');
      sb.append(escapeCsv(event.getTitle())).append(',');
      sb.append(user != null ? user.getUserId() : "").append(',');
      sb.append(escapeCsv(user != null ? displayName(user) : "")).append(',');
      sb.append(escapeCsv(user != null ? user.getEmail() : "")).append(',');
      sb.append(registration.getStatus().name()).append(',');
      sb.append(formatTime(registration.getRegisteredAt())).append('\n');
    }

    return sb.toString().getBytes(StandardCharsets.UTF_8);
  }

  private RegistrationResponse map(Registration registration) {
    Event event = registration.getEvent();
    User user = registration.getUser();
    return new RegistrationResponse(
        registration.getId(),
        event != null ? event.getEventId() : null,
        event != null ? event.getTitle() : null,
        event != null ? event.getStartTime() : null,
        event != null ? event.getEndTime() : null,
        event != null ? event.getVenue() : null,
        event != null ? event.getTotalSeats() : null,
        event != null ? event.getSeatsAvail() : null,
        registration.getStatus().name(),
        registration.getRegisteredAt(),
        user != null ? user.getUserId() : null,
        user != null ? displayName(user) : null,
        user != null ? user.getEmail() : null
    );
  }

  private String displayName(User user) {
    return (user.getFullName() != null && !user.getFullName().isBlank())
        ? user.getFullName()
        : user.getEmail();
  }

  private Event requireEvent(Long eventId) {
    return events.findById(eventId)
        .orElseThrow(() -> new NotFoundException("Không tìm thấy sự kiện."));
  }

  private User requireUser(Long userId) {
    return users.findById(userId)
        .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng."));
  }

  private int valueOrZero(Integer value) {
    return value != null ? Math.max(0, value) : 0;
  }

  private String escapeCsv(String value) {
    if (value == null) {
      return "";
    }
    String v = value.replace("\"", "\"\"");
    if (v.contains(",") || v.contains("\n") || v.contains("\r")) {
      return '"' + v + '"';
    }
    return v;
  }

  private String formatTime(LocalDateTime time) {
    return time != null ? CSV_TIME_FORMAT.format(time) : "";
  }
}
