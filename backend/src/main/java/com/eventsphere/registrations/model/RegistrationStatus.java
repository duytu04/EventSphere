package com.eventsphere.registrations.model;

public enum RegistrationStatus {
  CONFIRMED,
  REGISTERED,  // Alias for CONFIRMED
  WAITLISTED,
  ATTENDED,    // After attendance is marked
  CANCELLED
}
