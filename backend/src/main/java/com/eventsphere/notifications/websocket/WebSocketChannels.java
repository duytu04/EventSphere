package com.eventsphere.notifications.websocket;

public final class WebSocketChannels {
  private static final String SEATS_TOPIC_PREFIX = "/topic/seats.";

  private WebSocketChannels() {}

  public static String seats(Long eventId) {
    return SEATS_TOPIC_PREFIX + (eventId != null ? eventId : "unknown");
  }
}
