package com.eventsphere.feedback.web;

import com.eventsphere.feedback.dto.FeedbackCreateRequest;
import com.eventsphere.feedback.dto.FeedbackResponse;
import com.eventsphere.feedback.service.FeedbackService;
import com.eventsphere.security.AuthFacade;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService service;
    private final AuthFacade auth;

    // Public: lấy latest feedback cho FE
    @GetMapping("/api/public/feedback")
    public ResponseEntity<List<FeedbackResponse>> latest(
            @RequestParam Long eventId,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(service.latestForEvent(eventId, limit));
    }

    // Participant: gửi feedback
    @PostMapping("/api/feedback")
    public ResponseEntity<FeedbackResponse> create(@RequestBody @Valid FeedbackCreateRequest req) {
        Long me = auth.currentUserId();
        return ResponseEntity.ok(service.create(me, req));
    }

    // Public: trung bình rating (tiện cho card)
    @GetMapping("/api/public/feedback/avg")
    public ResponseEntity<Double> avg(@RequestParam Long eventId) {
        return ResponseEntity.ok(service.averageRating(eventId));
    }

    // Public: lấy recent feedback cho trang chủ
    @GetMapping("/api/feedback/recent")
    public ResponseEntity<List<FeedbackResponse>> recent(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(service.recentFeedback(limit));
    }

    // Public: lấy reviews cho event (tương thích với frontend)
    @GetMapping("/api/events/{eventId}/reviews")
    public ResponseEntity<List<FeedbackResponse>> eventReviews(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(service.latestForEvent(eventId, limit));
    }
}
