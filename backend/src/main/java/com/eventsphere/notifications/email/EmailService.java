package com.eventsphere.notifications.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailService {

  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  private final JavaMailSender mailSender;
  private final TemplateEngine templateEngine;
  private final String defaultFrom;

  public EmailService(JavaMailSender mailSender,
                      TemplateEngine templateEngine,
                      @Value("${spring.mail.username:eventsphere@localhost}") String defaultFrom) {
    this.mailSender = mailSender;
    this.templateEngine = templateEngine;
    this.defaultFrom = defaultFrom;
  }

  @Async
  public void sendTemplate(String to, String subject, String template, Map<String, Object> model) {
    Context ctx = new Context();
    if (model != null) {
      model.forEach(ctx::setVariable);
    }
    String body = templateEngine.process(template, ctx);
    sendHtml(to, subject, body);
  }

  @Async
  public void sendHtml(String to, String subject, String html) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
          StandardCharsets.UTF_8.name());
      helper.setFrom(defaultFrom);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(html, true);
      mailSender.send(message);
      log.debug("Sent HTML mail to {} with subject {}", to, subject);
    } catch (MessagingException | MailException ex) {
      log.error("Failed to send mail to {}", to, ex);
    }
  }

  @Async
  public void sendText(String to, String subject, String text) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
      helper.setFrom(defaultFrom);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(text, false);
      mailSender.send(message);
    } catch (MessagingException | MailException ex) {
      log.error("Failed to send mail to {}", to, ex);
    }
  }
}
