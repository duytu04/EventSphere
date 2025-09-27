package com.eventsphere.admin.repo;

import com.eventsphere.admin.model.AdminNotification;
import com.eventsphere.admin.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    
    List<AdminNotification> findByIsReadFalseOrderByCreatedAtDesc();
    
    List<AdminNotification> findByTypeOrderByCreatedAtDesc(NotificationType type);
    
    @Query("SELECT COUNT(n) FROM AdminNotification n WHERE n.isRead = false")
    long countUnreadNotifications();
    
    @Query("SELECT COUNT(n) FROM AdminNotification n WHERE n.isRead = false AND n.type = 'EVENT_EDIT_REQUEST'")
    long countUnreadEditRequests();
}

