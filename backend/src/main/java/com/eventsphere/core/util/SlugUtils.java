package com.eventsphere.core.util;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Utility to create slug/URL friendly strings. Keeps behaviour deterministic
 * and free from external dependencies.
 */
public final class SlugUtils {
  private SlugUtils() {}

  public static String toSlug(String input) {
    if (input == null) {
      return null;
    }
    String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
        .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    String slug = normalized
        .toLowerCase(Locale.ROOT)
        .replaceAll("[^a-z0-9]+", "-")
        .replaceAll("^-+", "")
        .replaceAll("-+$", "");
    return slug.isEmpty() ? "n-a" : slug;
  }

  public static String ensureLength(String slug, int maxLength) {
    if (slug == null) {
      return null;
    }
    if (maxLength <= 0 || slug.length() <= maxLength) {
      return slug;
    }
    return slug.substring(0, maxLength).replaceAll("-+$", "");
  }
}
