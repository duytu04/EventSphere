package com.eventsphere.registrations.service;

import com.eventsphere.registrations.dto.RegistrationResponse;
import com.eventsphere.registrations.dto.AttendanceResponse;
import com.eventsphere.registrations.dto.QrCodeResponse;
import com.eventsphere.registrations.model.Registration;
import com.eventsphere.registrations.model.RegistrationStatus;
import com.eventsphere.registrations.repo.RegistrationRepository;
import com.eventsphere.events.model.Event;
import com.eventsphere.events.repo.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepo;
    private final EventRepository eventRepo;

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationResponse> getMyRegistrations(Long userId) {
        List<Registration> registrations = registrationRepo.findByUser_UserIdOrderByRegisteredAtDesc(userId);
        return registrations.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public QrCodeResponse generateQRCode(Long userId, Long registrationId) {
        // Verify ownership
        Registration reg = registrationRepo.findByIdAndUser_UserId(registrationId, userId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        
        // Generate QR code data
        String qrData = "eventsphere://checkin?regId=" + registrationId + "&token=" + UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(1); // 1 hour expiry
        
        try {
            // Generate QR code image
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            com.google.zxing.common.BitMatrix bitMatrix = qrCodeWriter.encode(qrData, BarcodeFormat.QR_CODE, 200, 200);
            
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            
            // Convert to base64 data URL
            String qrCodeBase64 = "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
            
            return new QrCodeResponse(qrCodeBase64, expiresAt.toString());
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    @Override
    @Transactional
    public AttendanceResponse markAttendance(Long userId, Long registrationId) {
        // Verify ownership
        Registration reg = registrationRepo.findByIdAndUser_UserId(registrationId, userId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        
        // Update status to ATTENDED
        reg.setStatus(RegistrationStatus.ATTENDED);
        registrationRepo.save(reg);
        
        return new AttendanceResponse(true, "Attendance marked successfully");
    }

    @Override
    @Transactional
    public void cancelRegistration(Long userId, Long registrationId) {
        // Verify ownership
        Registration reg = registrationRepo.findByIdAndUser_UserId(registrationId, userId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        
        // Check if already cancelled
        if (reg.getStatus() == RegistrationStatus.CANCELLED) {
            throw new RuntimeException("Registration already cancelled");
        }
        
        // Update status to CANCELLED
        reg.setStatus(RegistrationStatus.CANCELLED);
        registrationRepo.save(reg);
        
        // Update available seats count
        Event event = reg.getEvent();
        event.setSeatsAvail(event.getSeatsAvail() + 1);
        eventRepo.save(event);
    }

    private RegistrationResponse toResponse(Registration reg) {
        return new RegistrationResponse(
                reg.getId(),
                reg.getEvent().getEventId(),
                reg.getEvent().getTitle(),
                reg.getEvent().getVenue(), // Sửa từ getLocation() thành getVenue()
                reg.getEvent().getStartTime(),
                reg.getEvent().getEndTime(),
                reg.getEvent().getMainImageUrl(), // Thêm ảnh đại diện sự kiện
                reg.getStatus(),
                reg.getRegisteredAt(),
                null, // QR code will be generated on demand
                reg.getStatus() == RegistrationStatus.ATTENDED
        );
    }
}