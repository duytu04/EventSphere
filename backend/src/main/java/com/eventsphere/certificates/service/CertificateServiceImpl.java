package com.eventsphere.certificates.service;

import com.eventsphere.certificates.dto.CertificateResponse;
import com.eventsphere.certificates.repo.CertificateAttendanceRepository;
import com.eventsphere.core.exception.ApiException;
import com.eventsphere.core.util.DateTimeUtils;
import com.eventsphere.core.util.SlugUtils;
import com.eventsphere.events.model.Event;
import com.eventsphere.registrations.model.Registration;
import com.eventsphere.registrations.model.RegistrationStatus;
import com.eventsphere.registrations.repo.RegistrationRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

  private final RegistrationRepository registrationRepo;
  private final CertificateAttendanceRepository attendanceRepo;

  @Override
  @Transactional(readOnly = true)
  public List<CertificateResponse> getMyCertificates(Long userId) {
    if (userId == null) {
      return List.of();
    }

    List<Registration> registrations = registrationRepo.findByUser_UserIdOrderByRegisteredAtDesc(userId);
    Map<Long, Registration> attendedByEvent = registrations.stream()
        .filter(r -> r.getStatus() == RegistrationStatus.ATTENDED)
        .collect(Collectors.toMap(r -> r.getEvent().getEventId(), r -> r, (left, right) -> left, LinkedHashMap::new));

    List<com.eventsphere.attendance.model.Attendance> attendanceList =
        attendanceRepo.findByUserIdOrderByMarkedAtDesc(userId);

    List<CertificateResponse> certificates = new ArrayList<>();
    for (com.eventsphere.attendance.model.Attendance attendance : attendanceList) {
      Registration reg = attendedByEvent.remove(attendance.getEventId());
      if (reg != null) {
        certificates.add(toResponse(reg, attendance));
      }
    }

    // Remaining registrations (attended but no explicit attendance record)
    attendedByEvent.values().forEach(reg -> certificates.add(toResponse(reg, null)));
    return certificates;
  }

  @Override
  @Transactional(readOnly = true)
  public CertificateResponse getCertificate(Long userId, Long certificateId) {
    Registration registration = registrationRepo.findById(certificateId)
        .filter(reg -> Objects.equals(reg.getUser().getUserId(), userId))
        .orElseThrow(() -> ApiException.notFound("Certificate not found"));

    if (registration.getStatus() != RegistrationStatus.ATTENDED) {
      throw ApiException.of(HttpStatus.CONFLICT, "Certificate not available yet", "CERT_NOT_READY", null);
    }

    var attendance = attendanceRepo.findByUserIdAndEventId(userId, registration.getEvent().getEventId()).orElse(null);
    return toResponse(registration, attendance);
  }

  private CertificateResponse toResponse(Registration registration,
                                         com.eventsphere.attendance.model.Attendance attendance) {
    Event event = registration.getEvent();
    LocalDateTime issueDate = attendance != null
        ? attendance.getMarkedAt()
        : DateTimeUtils.coalesce(event.getEndTime(), registration.getRegisteredAt());
    LocalDateTime expirationDate = issueDate != null ? issueDate.plusYears(1) : null;
    String status = resolveStatus(event, expirationDate);

    List<String> skills = new ArrayList<>();
    if (event.getCategory() != null && !event.getCategory().isBlank()) {
      skills.add(event.getCategory());
    }

    String credentialId = SlugUtils.ensureLength(
        SlugUtils.toSlug(event.getTitle()) + "-" + registration.getId(), 64);
    String certificateTitle = event.getTitle() != null
        ? event.getTitle() + " Certificate"
        : "Attendance Certificate";

    return new CertificateResponse(
        registration.getId(),
        event.getEventId(),
        event.getTitle(),
        certificateTitle,
        issueDate,
        expirationDate,
        credentialId,
        status,
        skills,
        event.getDescription()
    );
  }

  private String resolveStatus(Event event, LocalDateTime expirationDate) {
    LocalDateTime now = DateTimeUtils.now();
    if (event.getEndTime() != null && event.getEndTime().isAfter(now)) {
      return "IN_PROGRESS";
    }
    if (expirationDate != null && expirationDate.isBefore(now)) {
      return "EXPIRED";
    }
    return "VALID";
  }
}

