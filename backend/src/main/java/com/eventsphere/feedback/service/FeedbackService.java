package com.eventsphere.feedback.service;

import com.eventsphere.feedback.dto.FeedbackCreateRequest;
import com.eventsphere.feedback.dto.FeedbackResponse;

import java.util.List;

public interface FeedbackService {
    FeedbackResponse create(Long currentUserId, FeedbackCreateRequest req);
    List<FeedbackResponse> latestForEvent(Long eventId, int limit);
    double averageRating(Long eventId);
    List<FeedbackResponse> recentFeedback(int limit);
}
