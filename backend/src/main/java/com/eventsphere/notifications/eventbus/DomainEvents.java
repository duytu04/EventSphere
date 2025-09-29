package com.eventsphere.notifications.eventbus;

import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Simple static helper to publish domain events without passing the
 * {@link ApplicationEventPublisher} through every layer.
 */
@Component
public class DomainEvents {

  private static final Logger log = LoggerFactory.getLogger(DomainEvents.class);
  private static ApplicationEventPublisher publisher;

  public DomainEvents(ApplicationEventPublisher publisher) {
    DomainEvents.publisher = publisher;
  }

  public static void publish(Object event) {
    ApplicationEventPublisher pub = publisher;
    if (pub == null) {
      log.warn("Attempted to publish event {} before ApplicationEventPublisher was ready", event);
      return;
    }
    Objects.requireNonNull(event, "event must not be null");
    pub.publishEvent(event);
  }
}
