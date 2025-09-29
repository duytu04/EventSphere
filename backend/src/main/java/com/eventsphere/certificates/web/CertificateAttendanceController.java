package com.eventsphere.certificates.web;

import com.eventsphere.certificates.dto.AttendanceMarkRequest;
import com.eventsphere.certificates.dto.AttendanceResponse;
import com.eventsphere.certificates.service.AttendanceService;
import com.eventsphere.security.AuthFacade;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organizer/certificates")
@RequiredArgsConstructor
public class CertificateAttendanceController {

  private final AttendanceService attendanceService;
  private final AuthFacade auth;

  @PostMapping("/issue")
  public ResponseEntity<AttendanceResponse> issue(@RequestBody @Valid AttendanceMarkRequest request) {
    Long organizerId = auth.currentUserId();
    return ResponseEntity.ok(attendanceService.issueCertificate(organizerId, request));
  }
}