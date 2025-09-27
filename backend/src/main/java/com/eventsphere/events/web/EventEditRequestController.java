package com.eventsphere.events.web;

import com.eventsphere.events.dto.EventEditRequestDtos;
import com.eventsphere.events.service.EventEditRequestService;
import com.eventsphere.security.AuthFacade;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventEditRequestController {

    private final EventEditRequestService eventEditRequestService;
    private final AuthFacade authFacade;

    public EventEditRequestController(EventEditRequestService eventEditRequestService, AuthFacade authFacade) {
        this.eventEditRequestService = eventEditRequestService;
        this.authFacade = authFacade;
    }

    @PostMapping("/{eventId}/edit-request")
    @PreAuthorize("hasRole('ORGANIZER')")
    public EventEditRequestDtos.EventEditRequestResponse createEditRequest(
            @PathVariable Long eventId,
            @RequestBody EventEditRequestDtos.CreateEventEditRequestRequest request) {
        
        Long requesterId = authFacade.currentUserId();
        return eventEditRequestService.createEditRequest(eventId, request.requestedData(), requesterId);
    }

    @GetMapping("/edit-requests/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<EventEditRequestDtos.EventEditRequestResponse> getPendingRequests() {
        return eventEditRequestService.getPendingRequests();
    }

    @PostMapping("/edit-requests/{requestId}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public EventEditRequestDtos.EventEditRequestResponse processRequest(
            @PathVariable Long requestId,
            @RequestBody EventEditRequestDtos.ProcessEventEditRequestRequest request) {
        
        Long adminId = authFacade.currentUserId();
        return eventEditRequestService.processRequest(requestId, request.status(), request.adminNotes(), adminId);
    }
}
