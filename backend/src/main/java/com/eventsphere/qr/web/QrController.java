package com.eventsphere.qr.web;

import com.eventsphere.qr.QrService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@Validated
public class QrController {

  private final QrService qrService;

  public QrController(QrService qrService) {
    this.qrService = qrService;
  }

  @PostMapping("/render")
  public ResponseEntity<Map<String, String>> render(@RequestBody RenderRequest request) {
    int size = request.size != null ? request.size : 256;
    size = Math.max(64, Math.min(size, 1024));
    String dataUrl = qrService.generateDataUrl(request.payload, size);
    return ResponseEntity.ok(Map.of("dataUrl", dataUrl));
  }

  private record RenderRequest(@NotBlank String payload, @Positive Integer size) {}
}
