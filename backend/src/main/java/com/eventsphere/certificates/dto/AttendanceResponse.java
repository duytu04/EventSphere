package com.eventsphere.certificates.dto;

public record AttendanceResponse(boolean success,
                                  String message,
                                  CertificateResponse certificate) {
}
