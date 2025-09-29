package com.eventsphere.certificates.dto;

import jakarta.validation.constraints.AssertTrue;

public record AttendanceMarkRequest(
    Long registrationId,
    Long participantId,
    Long eventId,
    String certificateTitle,
    String notes
) {
  @AssertTrue(message = "Either registrationId or participantId+eventId must be provided")
  public boolean isValidCombination() {
    return registrationId != null || (participantId != null && eventId != null);
  }
}
