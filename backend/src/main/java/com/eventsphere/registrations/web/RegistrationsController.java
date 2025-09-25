package com.eventsphere.registrations.web;

import com.eventsphere.registrations.dto.RegistrationResponse;
import com.eventsphere.registrations.dto.AttendanceResponse;
import com.eventsphere.registrations.dto.QrCodeResponse;
import com.eventsphere.registrations.service.RegistrationService;
import com.eventsphere.security.AuthFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RegistrationsController {

    private final RegistrationService registrationService;
    private final AuthFacade auth;

    // Lấy danh sách đăng ký của user hiện tại
    @GetMapping("/api/me/registrations")
    public ResponseEntity<List<RegistrationResponse>> getMyRegistrations() {
        Long userId = auth.currentUserId();
        List<RegistrationResponse> registrations = registrationService.getMyRegistrations(userId);
        return ResponseEntity.ok(registrations);
    }

    // Tạo QR code cho registration
    @PostMapping("/api/me/registrations/{registrationId}/qr")
    public ResponseEntity<QrCodeResponse> generateQRCode(@PathVariable Long registrationId) {
        Long userId = auth.currentUserId();
        QrCodeResponse response = registrationService.generateQRCode(userId, registrationId);
        return ResponseEntity.ok(response);
    }

    // Đánh dấu attendance (quét QR)
    @PostMapping("/api/me/registrations/{registrationId}/attendance")
    public ResponseEntity<AttendanceResponse> markAttendance(@PathVariable Long registrationId) {
        Long userId = auth.currentUserId();
        AttendanceResponse response = registrationService.markAttendance(userId, registrationId);
        return ResponseEntity.ok(response);
    }

    // Hủy đăng ký
    @DeleteMapping("/api/me/registrations/{registrationId}")
    public ResponseEntity<Void> cancelRegistration(@PathVariable Long registrationId) {
        Long userId = auth.currentUserId();
        registrationService.cancelRegistration(userId, registrationId);
        return ResponseEntity.noContent().build();
    }

}