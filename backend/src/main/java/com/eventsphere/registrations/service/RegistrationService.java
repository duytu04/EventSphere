package com.eventsphere.registrations.service;

import com.eventsphere.registrations.dto.RegistrationResponse;
import com.eventsphere.registrations.dto.AttendanceResponse;
import com.eventsphere.registrations.dto.QrCodeResponse;

import java.util.List;

public interface RegistrationService {
    List<RegistrationResponse> getMyRegistrations(Long userId);
    QrCodeResponse generateQRCode(Long userId, Long registrationId);
    AttendanceResponse markAttendance(Long userId, Long registrationId);
    void cancelRegistration(Long userId, Long registrationId);
}