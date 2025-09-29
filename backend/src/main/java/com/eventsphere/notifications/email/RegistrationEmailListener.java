package com.eventsphere.notifications.email;

import com.eventsphere.notifications.eventbus.RegistrationCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class RegistrationEmailListener {

  private static final Logger log = LoggerFactory.getLogger(RegistrationEmailListener.class);
  private final EmailService emailService;

  public RegistrationEmailListener(EmailService emailService) {
    this.emailService = emailService;
  }

  @EventListener
  public void handleRegistrationCreated(RegistrationCreatedEvent event) {
    if (event == null || event.userEmail() == null) {
      return;
    }
    String subject = "Xác nhận đăng ký sự kiện: " + event.eventTitle();
    String body = """
        <p>Chào bạn,</p>
        <p>Bạn vừa đăng ký thành công sự kiện <strong>%s</strong>.</p>
        <p>Mã vé/đăng ký của bạn là <strong>%s</strong>. Vui lòng mang theo khi tham dự.</p>
        <p>Thời gian đăng ký: %s.</p>
        <p>Trân trọng,<br/>Đội ngũ EventSphere</p>
        """.formatted(
        event.eventTitle(),
        event.registrationId(),
        event.registeredAt() != null ? event.registeredAt() : "—");
    log.debug("Sending registration confirmation email to {}", event.userEmail());
    emailService.sendHtml(event.userEmail(), subject, body);
  }
}
