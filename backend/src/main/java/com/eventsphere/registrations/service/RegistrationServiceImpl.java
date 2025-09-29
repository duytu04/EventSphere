package com.eventsphere.registrations.service;

import com.eventsphere.events.model.Event;
import com.eventsphere.events.repo.EventRepository;
import com.eventsphere.notifications.eventbus.DomainEvents;
import com.eventsphere.notifications.eventbus.SeatsChangedEvent;
import com.eventsphere.qr.QrService;
import com.eventsphere.registrations.dto.AttendanceResponse;
import com.eventsphere.registrations.dto.QrCodeResponse;
import com.eventsphere.registrations.dto.RegistrationResponse;
import com.eventsphere.registrations.model.Registration;
import com.eventsphere.registrations.model.RegistrationStatus;
import com.eventsphere.registrations.repo.RegistrationRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

  private final RegistrationRepository registrationRepo;
  private final EventRepository eventRepo;
  private final QrService qrService;

  @Override
  @Transactional(readOnly = true)
  public List<RegistrationResponse> getMyRegistrations(Long userId) {
    List<Registration> registrations = registrationRepo.findByUser_UserIdOrderByRegisteredAtDesc(userId);
    return registrations.stream().map(this::toResponse).toList();
  }

  @Override
  @Transactional
  public QrCodeResponse generateQRCode(Long userId, Long registrationId) {
    Registration reg = registrationRepo.findByIdAndUser_UserId(registrationId, userId)
        .orElseThrow(() -> new RuntimeException("Registration not found"));

    String qrData = "eventsphere://checkin?regId=" + registrationId + "&token=" + UUID.randomUUID();
    LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);
    String dataUrl = qrService.generateDataUrl(qrData, 240);
    return new QrCodeResponse(dataUrl, expiresAt.toString());
  }

  @Override
  @Transactional
  public AttendanceResponse markAttendance(Long userId, Long registrationId) {
    Registration reg = registrationRepo.findByIdAndUser_UserId(registrationId, userId)
        .orElseThrow(() -> new RuntimeException("Registration not found"));

    reg.setStatus(RegistrationStatus.ATTENDED);
    registrationRepo.save(reg);
    return new AttendanceResponse(true, "Attendance marked successfully");
  }

  @Override
  @Transactional
  public void cancelRegistration(Long userId, Long registrationId) {
    Registration reg = registrationRepo.findByIdAndUser_UserId(registrationId, userId)
        .orElseThrow(() -> new RuntimeException("Registration not found"));

    if (reg.getStatus() == RegistrationStatus.CANCELLED) {
      throw new RuntimeException("Registration already cancelled");
    }

    reg.setStatus(RegistrationStatus.CANCELLED);
    registrationRepo.save(reg);

    Event event = reg.getEvent();
    event.setSeatsAvail(event.getSeatsAvail() + 1);
    eventRepo.save(event);
    DomainEvents.publish(new SeatsChangedEvent(event.getEventId(), event.getSeatsAvail()));
  }

  private RegistrationResponse toResponse(Registration reg) {
    Event event = reg.getEvent();
    return new RegistrationResponse(
        reg.getId(),
        event.getEventId(),
        event.getTitle(),
        event.getVenue(),
        event.getStartTime(),
        event.getEndTime(),
        event.getMainImageUrl(),
        reg.getStatus(),
        reg.getRegisteredAt(),
        null,
        reg.getStatus() == RegistrationStatus.ATTENDED
    );
  }
}
