package com.eventsphere.admin.service;

import com.eventsphere.admin.dto.AdminNotificationDtos;
import com.eventsphere.admin.model.AdminNotification;
import com.eventsphere.admin.model.NotificationType;
import com.eventsphere.admin.repo.AdminNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminNotificationService {

    private final AdminNotificationRepository notificationRepo;

    public AdminNotificationService(AdminNotificationRepository notificationRepo) {
        this.notificationRepo = notificationRepo;
    }

    public List<AdminNotificationDtos.AdminNotificationResponse> getUnreadNotifications() {
        return notificationRepo.findByIsReadFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AdminNotificationDtos.AdminNotificationResponse> getAllNotifications() {
        return notificationRepo.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AdminNotificationDtos.NotificationStatsResponse getNotificationStats() {
        long totalUnread = notificationRepo.countUnreadNotifications();
        long editRequestUnread = notificationRepo.countUnreadEditRequests();
        
        return new AdminNotificationDtos.NotificationStatsResponse(
                totalUnread,
                editRequestUnread,
                0L, // approvalRequestUnread - implement later
                0L, // userRegistrationUnread - implement later
                0L  // systemAlertUnread - implement later
        );
    }

    public void markAsRead(Long notificationId) {
        AdminNotification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepo.save(notification);
    }

    public void markAllAsRead() {
        List<AdminNotification> unreadNotifications = notificationRepo.findByIsReadFalseOrderByCreatedAtDesc();
        LocalDateTime now = LocalDateTime.now();
        
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(now);
        });
        
        notificationRepo.saveAll(unreadNotifications);
    }

    public void createNotification(String title, String message, NotificationType type, String data) {
        AdminNotification notification = AdminNotification.builder()
                .type(type)
                .title(title)
                .message(message)
                .data(data)
                .isRead(false)
                .build();

        notificationRepo.save(notification);
    }

    private AdminNotificationDtos.AdminNotificationResponse mapToResponse(AdminNotification notification) {
        return new AdminNotificationDtos.AdminNotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getData(),
                notification.getIsRead(),
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
}

