package com.eventsphere.attendance.dto;

import jakarta.validation.constraints.NotNull;

// Organizer mark bằng QR (qrToken) hoặc manual (userId + eventId)
public record AttendanceMarkRequest(
        String qrToken,     // ưu tiên nếu có
        Long userId,        // cho manual
        @NotNull Long eventId
) {}
