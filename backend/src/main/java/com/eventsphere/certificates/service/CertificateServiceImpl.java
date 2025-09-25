package com.eventsphere.certificates.service;

import com.eventsphere.certificates.dto.CertificateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    @Override
    @Transactional(readOnly = true)
    public List<CertificateResponse> getMyCertificates(Long userId) {
        // For now, return empty list
        // In a real implementation, you would query the database for certificates
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse getCertificate(Long userId, Long certificateId) {
        // For now, return a mock certificate
        // In a real implementation, you would query the database
        throw new RuntimeException("Certificate not found");
    }
}
