
// WebSocket side (SeatsBroadcaster) sẽ @EventListener cái event này và bắn lên /topic/seats.{eventId}.







package com.eventsphere.notifications.eventbus;

public record SeatsChangedEvent(Long eventId, Integer seatsAvailable) {}
