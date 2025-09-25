package com.eventsphere.registrations.dto;

public record QrCodeResponse(
    String qrCode,
    String expiresAt
) {}
