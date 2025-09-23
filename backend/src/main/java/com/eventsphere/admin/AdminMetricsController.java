package com.eventsphere.admin;

import com.eventsphere.admin.dto.AdminMetricsResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMetricsController {

  private final AdminMetricsService metricsService;

  public AdminMetricsController(AdminMetricsService metricsService) {
    this.metricsService = metricsService;
  }

  @GetMapping("/metrics")
  public AdminMetricsResponse metrics() {
    return metricsService.snapshot();
  }
}
