package com.eventsphere.notifications.websocket;

import java.util.Map;

import com.eventsphere.notifications.eventbus.SeatsChangedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class SeatsBroadcaster {

  private static final Logger log = LoggerFactory.getLogger(SeatsBroadcaster.class);
  private final SimpMessagingTemplate messagingTemplate;

  public SeatsBroadcaster(SimpMessagingTemplate messagingTemplate) {
    this.messagingTemplate = messagingTemplate;
  }

  @EventListener
  public void onSeatsChanged(SeatsChangedEvent event) {
    if (event == null || event.eventId() == null) {
      return;
    }
    String destination = WebSocketChannels.seats(event.eventId());
    Map<String, Object> payload = Map.of(
        "eventId", event.eventId(),
        "seatsAvailable", event.seatsAvailable()
    );
    log.debug("Broadcasting seats update {} -> {}", destination, payload);
    messagingTemplate.convertAndSend(destination, payload);
  }
}
