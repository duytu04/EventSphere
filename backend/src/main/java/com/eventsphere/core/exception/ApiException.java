package com.eventsphere.core.exception;

import java.io.Serializable;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;

/**
 * Runtime exception that carries HTTP status, an optional error code and
 * additional payload. Controller advice can translate this into a
 * consistent API response.
 */
public class ApiException extends RuntimeException implements Serializable {
  private static final long serialVersionUID = 1L;

  private final HttpStatus status;
  private final String code;
  private final Map<String, Object> extra;

  public ApiException(HttpStatus status, String message) {
    this(status, message, null, null, null);
  }

  public ApiException(HttpStatus status, String message, Throwable cause) {
    this(status, message, null, cause, null);
  }

  public ApiException(HttpStatus status, String message, String code) {
    this(status, message, code, null, null);
  }

  public ApiException(HttpStatus status,
                      String message,
                      String code,
                      Throwable cause,
                      Map<String, Object> extra) {
    super(message, cause, true, true);
    this.status = Objects.requireNonNull(status, "status must not be null");
    this.code = code;
    if (extra == null || extra.isEmpty()) {
      this.extra = Collections.emptyMap();
    } else {
      this.extra = Collections.unmodifiableMap(new LinkedHashMap<>(extra));
    }
  }

  public HttpStatus getStatus() {
    return status;
  }

  public String getCode() {
    return code;
  }

  public Map<String, Object> getExtra() {
    return extra;
  }

  public static ApiException badRequest(String message) {
    return new ApiException(HttpStatus.BAD_REQUEST, message);
  }

  public static ApiException forbidden(String message) {
    return new ApiException(HttpStatus.FORBIDDEN, message);
  }

  public static ApiException notFound(String message) {
    return new ApiException(HttpStatus.NOT_FOUND, message);
  }

  public static ApiException conflict(String message) {
    return new ApiException(HttpStatus.CONFLICT, message);
  }

  public static ApiException of(HttpStatus status,
                                String message,
                                String code,
                                Map<String, Object> extra) {
    return new ApiException(status, message, code, null, extra);
  }
}
