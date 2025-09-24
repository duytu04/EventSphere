package com.eventsphere.registrations.service;

import com.eventsphere.registrations.dto.RegistrationResponse;
import java.util.List;

public interface RegistrationService {

  RegistrationResponse register(Long eventId, Long userId);

  List<RegistrationResponse> listForUser(Long userId);

  List<RegistrationResponse> listForEvent(Long eventId);

  void cancel(Long registrationId, Long userId);

  byte[] exportCsv(Long eventId);
}
