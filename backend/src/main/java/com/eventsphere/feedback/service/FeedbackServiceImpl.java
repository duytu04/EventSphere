package com.eventsphere.feedback.service;

import com.eventsphere.core.exception.BadRequestException;
import com.eventsphere.feedback.dto.FeedbackCreateRequest;
import com.eventsphere.feedback.dto.FeedbackResponse;
import com.eventsphere.feedback.model.Feedback;
import com.eventsphere.feedback.repo.FeedbackRepository;
import com.eventsphere.registrations.model.RegistrationStatus;
import com.eventsphere.registrations.repo.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepo;
    private final RegistrationRepository registrationRepo;

    @Override
    @Transactional
    public FeedbackResponse create(Long currentUserId, FeedbackCreateRequest req) {
        var regOpt = registrationRepo.findByUser_UserIdAndEvent_EventId(currentUserId, req.eventId());
        if (regOpt.isEmpty()) {
            throw new BadRequestException("You must register before leaving feedback.");
        }
        var reg = regOpt.get();
        if (!(reg.getStatus() == RegistrationStatus.CONFIRMED || reg.getStatus() == RegistrationStatus.ATTENDED)) {
            throw new BadRequestException("Your registration status does not allow feedback.");
        }

        Feedback fb = Feedback.builder()
                .userId(currentUserId)
                .eventId(req.eventId())
                .rating(req.rating())
                .comment(req.comment())
                .build();
        fb = feedbackRepo.save(fb);
        return toResponse(fb);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> latestForEvent(Long eventId, int limit) {
        return feedbackRepo.findByEventIdOrderByCreatedAtDesc(eventId, PageRequest.of(0, Math.max(1, limit)))
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public double averageRating(Long eventId) {
        return feedbackRepo.avgRatingByEventId(eventId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> recentFeedback(int limit) {
        return feedbackRepo.findTopByOrderByCreatedAtDesc(PageRequest.of(0, Math.max(1, limit)))
                .stream().map(this::toResponse).toList();
    }

    private FeedbackResponse toResponse(Feedback f) {
        return new FeedbackResponse(f.getId(), f.getUserId(), f.getEventId(), f.getRating(), f.getComment(), f.getCreatedAt());
    }
}
