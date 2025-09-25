package com.eventsphere.certificates.web;

import com.eventsphere.certificates.dto.CertificateResponse;
import com.eventsphere.certificates.service.CertificateService;
import com.eventsphere.security.AuthFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CertificatesController {

    private final CertificateService certificateService;
    private final AuthFacade auth;

    // Lấy danh sách chứng nhận của user hiện tại
    @GetMapping("/api/me/certificates")
    public ResponseEntity<List<CertificateResponse>> getMyCertificates() {
        Long userId = auth.currentUserId();
        List<CertificateResponse> certificates = certificateService.getMyCertificates(userId);
        return ResponseEntity.ok(certificates);
    }

    // Lấy chi tiết chứng nhận
    @GetMapping("/api/me/certificates/{certificateId}")
    public ResponseEntity<CertificateResponse> getCertificate(@PathVariable Long certificateId) {
        Long userId = auth.currentUserId();
        CertificateResponse certificate = certificateService.getCertificate(userId, certificateId);
        return ResponseEntity.ok(certificate);
    }
}
