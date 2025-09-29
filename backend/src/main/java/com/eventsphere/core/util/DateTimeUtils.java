package com.eventsphere.core.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

/**
 * Helper utilities for dealing with java.time across the application.
 */
public final class DateTimeUtils {
  private static final ZoneId DEFAULT_ZONE = ZoneId.systemDefault();
  private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

  private DateTimeUtils() {}

  public static LocalDateTime now() {
    return LocalDateTime.now(DEFAULT_ZONE);
  }

  public static LocalDate today() {
    return LocalDate.now(DEFAULT_ZONE);
  }

  public static String formatIso(LocalDateTime value) {
    return value == null ? null : ISO.format(value);
  }

  public static LocalDateTime parseIso(String value) {
    return (value == null || value.isBlank()) ? null : LocalDateTime.parse(value, ISO);
  }

  public static boolean isPast(LocalDateTime value) {
    return value != null && value.isBefore(now());
  }

  public static boolean isFuture(LocalDateTime value) {
    return value != null && value.isAfter(now());
  }

  public static LocalDateTime toLocalDateTime(Instant instant) {
    return instant == null ? null : LocalDateTime.ofInstant(instant, DEFAULT_ZONE);
  }

  public static Instant toInstant(LocalDateTime value) {
    return value == null ? null : value.atZone(DEFAULT_ZONE).toInstant();
  }

  public static LocalDateTime coalesce(LocalDateTime preferred, LocalDateTime fallback) {
    return preferred != null ? preferred : fallback;
  }

  public static LocalDateTime min(LocalDateTime a, LocalDateTime b) {
    if (a == null) return b;
    if (b == null) return a;
    return a.isBefore(b) ? a : b;
  }

  public static LocalDateTime max(LocalDateTime a, LocalDateTime b) {
    if (a == null) return b;
    if (b == null) return a;
    return a.isAfter(b) ? a : b;
  }

  public static boolean equalsIgnoringSeconds(LocalDateTime a, LocalDateTime b) {
    if (a == b) return true;
    if (a == null || b == null) return false;
    return Objects.equals(a.withSecond(0).withNano(0), b.withSecond(0).withNano(0));
  }
}
