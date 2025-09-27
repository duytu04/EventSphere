package com.eventsphere.admin.web;

import com.eventsphere.admin.dto.AdminNotificationDtos;
import com.eventsphere.admin.service.AdminNotificationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final AdminNotificationService notificationService;

    public AdminNotificationController(AdminNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/notifications")
    public List<AdminNotificationDtos.AdminNotificationResponse> getNotifications(
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        
        if (unreadOnly) {
            return notificationService.getUnreadNotifications();
        }
        return notificationService.getAllNotifications();
    }

    @GetMapping("/notifications/stats")
    public AdminNotificationDtos.NotificationStatsResponse getNotificationStats() {
        return notificationService.getNotificationStats();
    }

    @PostMapping("/notifications/{notificationId}/read")
    public void markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
    }

    @PostMapping("/notifications/read-all")
    public void markAllAsRead() {
        notificationService.markAllAsRead();
    }
}

