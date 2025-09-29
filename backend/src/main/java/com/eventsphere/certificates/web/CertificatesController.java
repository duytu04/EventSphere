package com.eventsphere.certificates.web;

import com.eventsphere.certificates.dto.CertificateResponse;
import com.eventsphere.certificates.service.CertificateService;
import com.eventsphere.core.exception.ApiException;
import com.eventsphere.security.AuthFacade;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CertificatesController {

  private final CertificateService certificateService;
  private final AuthFacade auth;

  @GetMapping("/api/me/certificates")
  public ResponseEntity<List<CertificateResponse>> getMyCertificates() {
    Long userId = auth.currentUserId();
    if (userId == null) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }
    List<CertificateResponse> certificates = certificateService.getMyCertificates(userId);
    return ResponseEntity.ok(certificates);
  }

  @GetMapping("/api/me/certificates/{certificateId}")
  public ResponseEntity<CertificateResponse> getCertificate(@PathVariable Long certificateId) {
    Long userId = auth.currentUserId();
    if (userId == null) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }
    CertificateResponse certificate = certificateService.getCertificate(userId, certificateId);
    return ResponseEntity.ok(certificate);
  }
}