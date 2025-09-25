package com.eventsphere.attendance.web;

import com.eventsphere.attendance.dto.AttendanceMarkRequest;
import com.eventsphere.attendance.dto.AttendanceResponse;
import com.eventsphere.attendance.service.AttendanceService;
import com.eventsphere.security.AuthFacade;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AuthFacade auth;

    // Participant bấm "Xem QR" -> sinh token mới (các token cũ của cặp user-event bị vô hiệu)
    @PostMapping("/api/attendance/qr/start")
    public ResponseEntity<String> startQr(@RequestParam @NotNull Long eventId) {
        Long me = auth.currentUserId();
        String token = attendanceService.createQrTokenForMe(me, eventId);
        return ResponseEntity.ok(token);
    }

    // Organizer mark (scan QR hoặc manual)
    @PostMapping("/api/organizer/attendance/mark")
    public ResponseEntity<AttendanceResponse> mark(@RequestBody @Valid AttendanceMarkRequest req) {
        Long organizerId = auth.currentUserId();
        return ResponseEntity.ok(attendanceService.markByOrganizer(organizerId, req));
    }

    // Organizer xem lịch sử điểm danh của sự kiện
    @GetMapping("/api/organizer/attendance/logs")
    public ResponseEntity<?> logs(
            @RequestParam @NotNull Long eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long organizerId = auth.currentUserId();
        return ResponseEntity.ok(attendanceService.getLogsForEvent(organizerId, eventId, page, size));
    }
}
