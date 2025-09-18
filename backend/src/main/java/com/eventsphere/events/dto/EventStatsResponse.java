package com.eventsphere.events.dto;

public record EventStatsResponse(long total, long approved, long pending, long rejected) {}
