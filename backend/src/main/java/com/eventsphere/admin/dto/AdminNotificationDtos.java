package com.eventsphere.admin.dto;

import com.eventsphere.admin.model.NotificationType;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class AdminNotificationDtos {

    public record AdminNotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String message,
        String data,
        Boolean isRead,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime readAt
    ) {}

    public record NotificationStatsResponse(
        long totalUnread,
        long editRequestUnread,
        long approvalRequestUnread,
        long userRegistrationUnread,
        long systemAlertUnread
    ) {}
}

