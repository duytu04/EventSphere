package com.eventsphere.events.service;

import com.eventsphere.events.dto.EventEditRequestDtos;
import com.eventsphere.events.model.Event;
import com.eventsphere.events.model.EventEditRequest;
import com.eventsphere.events.model.EventEditRequestStatus;
import com.eventsphere.events.repo.EventEditRequestRepository;
import com.eventsphere.events.repo.EventRepository;
import com.eventsphere.users.model.User;
import com.eventsphere.users.repo.UserRepository;
import com.eventsphere.admin.model.AdminNotification;
import com.eventsphere.admin.model.NotificationType;
import com.eventsphere.admin.repo.AdminNotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EventEditRequestService {

    private final EventEditRequestRepository eventEditRequestRepo;
    private final EventRepository eventRepo;
    private final UserRepository userRepo;
    private final AdminNotificationRepository notificationRepo;
    private final ObjectMapper objectMapper;

    public EventEditRequestService(
            EventEditRequestRepository eventEditRequestRepo,
            EventRepository eventRepo,
            UserRepository userRepo,
            AdminNotificationRepository notificationRepo,
            ObjectMapper objectMapper) {
        this.eventEditRequestRepo = eventEditRequestRepo;
        this.eventRepo = eventRepo;
        this.userRepo = userRepo;
        this.notificationRepo = notificationRepo;
        this.objectMapper = objectMapper;
    }

    public EventEditRequestDtos.EventEditRequestResponse createEditRequest(
            Long eventId, 
            String requestedData, 
            Long requesterId) {
        
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        User requester = userRepo.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lưu dữ liệu gốc
        String originalData = serializeEventData(event);

        EventEditRequest request = EventEditRequest.builder()
                .event(event)
                .requester(requester)
                .originalData(originalData)
                .requestedData(requestedData)
                .status(EventEditRequestStatus.PENDING)
                .build();

        EventEditRequest savedRequest = eventEditRequestRepo.save(request);

        // Tạo thông báo cho admin
        createAdminNotification(
                "Yêu cầu chỉnh sửa sự kiện",
                String.format("Người dùng %s yêu cầu chỉnh sửa sự kiện '%s'", 
                        requester.getFullName() != null ? requester.getFullName() : requester.getEmail(),
                        event.getTitle()),
                NotificationType.EVENT_EDIT_REQUEST,
                String.format("{\"requestId\": %d, \"eventId\": %d, \"requesterId\": %d}", 
                        savedRequest.getId(), eventId, requesterId)
        );

        return mapToResponse(savedRequest);
    }

    public List<EventEditRequestDtos.EventEditRequestResponse> getPendingRequests() {
        return eventEditRequestRepo.findByStatusOrderByCreatedAtDesc(EventEditRequestStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EventEditRequestDtos.EventEditRequestResponse processRequest(
            Long requestId, 
            EventEditRequestStatus status, 
            String adminNotes, 
            Long adminId) {
        
        EventEditRequest request = eventEditRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Edit request not found"));

        User admin = userRepo.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        request.setStatus(status);
        request.setAdminNotes(adminNotes);
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(admin);

        EventEditRequest savedRequest = eventEditRequestRepo.save(request);

        // Nếu được duyệt, cập nhật sự kiện
        if (status == EventEditRequestStatus.APPROVED) {
            updateEventFromRequest(request);
        }

        return mapToResponse(savedRequest);
    }

    private void updateEventFromRequest(EventEditRequest request) {
        try {
            Event event = request.getEvent();
            
            // Update event fields from the edit request
            if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
                event.setTitle(request.getTitle().trim());
            }
            
            if (request.getDescription() != null) {
                event.setDescription(request.getDescription());
            }
            
            if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
                event.setCategory(request.getCategory().trim());
            }
            
            if (request.getVenue() != null && !request.getVenue().trim().isEmpty()) {
                event.setVenue(request.getVenue().trim());
            }
            
            if (request.getStartTime() != null) {
                event.setStartTime(request.getStartTime());
            }
            
            if (request.getEndTime() != null) {
                event.setEndTime(request.getEndTime());
            }
            
            if (request.getCapacity() != null && request.getCapacity() >= 0) {
                event.setTotalSeats(request.getCapacity());
                // Update seats available to match new capacity if needed
                if (event.getSeatsAvail() > request.getCapacity()) {
                    event.setSeatsAvail(request.getCapacity());
                }
            }
            
            if (request.getMainImageUrl() != null) {
                event.setMainImageUrl(request.getMainImageUrl());
            }
            
            // Save the updated event
            eventRepo.save(event);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to update event from request", e);
        }
    }

    private void createAdminNotification(String title, String message, NotificationType type, String data) {
        AdminNotification notification = AdminNotification.builder()
                .type(type)
                .title(title)
                .message(message)
                .data(data)
                .isRead(false)
                .build();

        notificationRepo.save(notification);
    }

    private String serializeEventData(Event event) {
        try {
            return objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize event data", e);
        }
    }

    private EventEditRequestDtos.EventEditRequestResponse mapToResponse(EventEditRequest request) {
        return new EventEditRequestDtos.EventEditRequestResponse(
                request.getId(),
                request.getEvent().getEventId(),
                request.getEvent().getTitle(),
                request.getRequester().getUserId(),
                request.getRequester().getFullName() != null ? 
                        request.getRequester().getFullName() : 
                        request.getRequester().getEmail(),
                request.getRequester().getEmail(),
                request.getOriginalData(),
                request.getRequestedData(),
                request.getStatus(),
                request.getAdminNotes(),
                request.getCreatedAt(),
                request.getUpdatedAt(),
                request.getProcessedAt(),
                request.getProcessedBy() != null ? request.getProcessedBy().getUserId() : null,
                request.getProcessedBy() != null ? 
                        (request.getProcessedBy().getFullName() != null ? 
                                request.getProcessedBy().getFullName() : 
                                request.getProcessedBy().getEmail()) : null
        );
    }
}

