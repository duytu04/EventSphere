// src/main/java/com/eventsphere/core/exception/GlobalExceptionHandler.java
package com.eventsphere.core.exception;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<Object> handleApiException(ApiException ex) {
    HttpStatus status = ex.getStatus();
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("status", status.value());
    body.put("error", status.getReasonPhrase());
    body.put("message", ex.getMessage());
    body.put("timestamp", OffsetDateTime.now());
    if (ex.getCode() != null) {
      body.put("code", ex.getCode());
    }
    if (!ex.getExtra().isEmpty()) {
      body.put("details", ex.getExtra());
    }
    return ResponseEntity.status(status).body(body);
  }

  // 400 cho lỗi validate body (ví dụ: @NotBlank, @Size, ...)
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
    List<Map<String, String>> errors = ex.getBindingResult()
        .getFieldErrors()
        .stream()
        .map(fe -> Map.of(
            "field", fe.getField(),
            "message", fe.getDefaultMessage()
        ))
        .toList();

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("status", 400);
    body.put("message", "Dữ liệu không hợp lệ");
    body.put("errors", errors);
    body.put("timestamp", OffsetDateTime.now());
    return ResponseEntity.badRequest().body(body);
  }

  // Dự phòng: nếu vẫn rơi xuống DB (Data too long / SQLState 22001 / MySQL 1406) cho cột main_image_url
  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<Object> handleDataIntegrity(DataIntegrityViolationException ex) {
    String msg = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
    if (msg == null) msg = "";

    boolean lengthProblem =
        msg.contains("main_image_url") ||
        msg.contains("Data too long") ||           // MySQL 1406
        msg.contains("value too long") ||
        msg.contains("SQLState: 22001");           // chuẩn SQL: string data, right truncation

    if (lengthProblem) {
      return ResponseEntity.badRequest().body(Map.of(
          "status", 400,
          "message", "Đường dẫn ảnh quá dài (tối đa 512 ký tự)",
          "timestamp", OffsetDateTime.now()
      ));
    }

    log.error("Unhandled data integrity violation", ex);

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
        "status", 500,
        "message", "Lỗi dữ liệu",
        "timestamp", OffsetDateTime.now()
    ));
  }
}
