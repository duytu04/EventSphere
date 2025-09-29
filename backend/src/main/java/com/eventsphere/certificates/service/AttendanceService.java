package com.eventsphere.certificates.service;

import com.eventsphere.certificates.dto.AttendanceMarkRequest;
import com.eventsphere.certificates.dto.AttendanceResponse;
import com.eventsphere.certificates.repo.CertificateAttendanceRepository;
import com.eventsphere.core.exception.ApiException;
import com.eventsphere.registrations.model.Registration;
import com.eventsphere.registrations.model.RegistrationStatus;
import com.eventsphere.registrations.repo.RegistrationRepository;
import com.eventsphere.attendance.model.AttendanceMethod;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttendanceService {

  private final RegistrationRepository registrationRepo;
  private final CertificateAttendanceRepository attendanceRepo;
  private final CertificateService certificateService;

  @Transactional
  public AttendanceResponse issueCertificate(Long organizerId, AttendanceMarkRequest request) {
    if (organizerId == null) {
      throw ApiException.forbidden("Organizer authentication required");
    }

    Registration registration = resolveRegistration(request)
        .orElseThrow(() -> ApiException.notFound("Registration not found"));

    if (registration.getEvent().getOrganizerId() != null
        && !Objects.equals(registration.getEvent().getOrganizerId(), organizerId)) {
      throw ApiException.forbidden("You are not allowed to issue certificates for this event");
    }

    if (registration.getStatus() == RegistrationStatus.CANCELLED) {
      throw ApiException.of(HttpStatus.CONFLICT, "Registration was cancelled", "REG_CANCELLED", null);
    }

    if (registration.getStatus() != RegistrationStatus.ATTENDED) {
      registration.setStatus(RegistrationStatus.ATTENDED);
      registrationRepo.save(registration);
    }

    attendanceRepo.ensureRecord(
        registration.getUser().getUserId(),
        registration.getEvent().getEventId(),
        AttendanceMethod.MANUAL);

    var certificate = certificateService.getCertificate(
        registration.getUser().getUserId(),
        registration.getId());
    return new AttendanceResponse(true, "Certificate issued successfully", certificate);
  }

  private java.util.Optional<Registration> resolveRegistration(AttendanceMarkRequest request) {
    if (request.registrationId() != null) {
      return registrationRepo.findById(request.registrationId());
    }
    if (request.participantId() != null && request.eventId() != null) {
      return registrationRepo.findByUser_UserIdAndEvent_EventId(request.participantId(), request.eventId());
    }
    return java.util.Optional.empty();
  }
}

