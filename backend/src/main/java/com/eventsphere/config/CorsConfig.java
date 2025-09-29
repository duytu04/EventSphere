package com.eventsphere.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

  private final List<String> allowedOrigins;

  public CorsConfig(@Value("${app.cors.allowed-origins:*}") String[] allowedOrigins) {
    this.allowedOrigins = Arrays.stream(allowedOrigins)
        .filter(origin -> origin != null && !origin.isBlank())
        .map(String::trim)
        .toList();
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    CorsRegistration registration = registry.addMapping("/**")
        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .exposedHeaders("Authorization", "Link")
        .allowCredentials(true)
        .maxAge(3600);

    String[] origins = resolveOrigins();
    if (shouldUsePatterns(origins)) {
      registration.allowedOriginPatterns(origins.length == 0 ? new String[] {"*"} : origins);
    } else {
      registration.allowedOrigins(origins);
    }
  }

  private String[] resolveOrigins() {
    if (allowedOrigins.isEmpty()) {
      return new String[0];
    }
    return allowedOrigins.toArray(String[]::new);
  }

  private boolean shouldUsePatterns(String[] origins) {
    if (origins.length == 0) {
      return true;
    }
    return Arrays.stream(origins).anyMatch(origin -> origin.equals("*") || origin.contains("*"));
  }
}
