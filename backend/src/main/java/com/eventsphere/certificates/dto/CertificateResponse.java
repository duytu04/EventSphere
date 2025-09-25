package com.eventsphere.certificates.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CertificateResponse(
        Long id,
        Long eventId,
        String eventName,
        String title,
        LocalDateTime issueDate,
        LocalDateTime expirationDate,
        String credentialId,
        String status,
        List<String> skills,
        String description
) {}
