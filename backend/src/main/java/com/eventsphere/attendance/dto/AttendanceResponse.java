package com.eventsphere.attendance.dto;

import com.eventsphere.attendance.model.AttendanceMethod;

import java.time.LocalDateTime;

public record AttendanceResponse(
        Long id,
        Long userId,
        Long eventId,
        AttendanceMethod method,
        LocalDateTime markedAt
) {}
