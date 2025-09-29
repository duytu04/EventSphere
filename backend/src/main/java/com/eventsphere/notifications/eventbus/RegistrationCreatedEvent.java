package com.eventsphere.notifications.eventbus;

import java.time.LocalDateTime;

public record RegistrationCreatedEvent(Long registrationId,
                                        Long userId,
                                        String userEmail,
                                        Long eventId,
                                        String eventTitle,
                                        LocalDateTime registeredAt) {
}
