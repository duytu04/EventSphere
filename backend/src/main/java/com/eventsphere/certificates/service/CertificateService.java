package com.eventsphere.certificates.service;

import com.eventsphere.certificates.dto.CertificateResponse;

import java.util.List;

public interface CertificateService {
    List<CertificateResponse> getMyCertificates(Long userId);
    CertificateResponse getCertificate(Long userId, Long certificateId);
}
