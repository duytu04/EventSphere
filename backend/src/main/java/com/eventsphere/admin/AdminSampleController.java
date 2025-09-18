// src/main/java/com/eventsphere/admin/AdminSampleController.java
package com.eventsphere.admin;

import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminSampleController {
  @GetMapping("/sample")
  public Map<String,String> sample(){ return Map.of("status","admin-ok"); }
}
