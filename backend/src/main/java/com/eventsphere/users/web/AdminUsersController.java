package com.eventsphere.users.web;

import com.eventsphere.users.dto.AdminUserDtos.*;
import com.eventsphere.users.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUsersController {

  private final AdminUserService svc;

  @GetMapping
  public Page<UserResponse> list(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String role,
      @PageableDefault(size = 10) Pageable pageable
  ) {
    return svc.list(q, role, pageable);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public UserResponse create(@Valid @RequestBody CreateUserRequest req) {
    return svc.create(req);
  }

  @PutMapping("/{id}")
  public UserResponse update(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
    return svc.update(id, req);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    svc.delete(id);
  }

  @PostMapping("/{id}/enable")
  public UserResponse setEnabled(@PathVariable Long id, @RequestParam boolean enabled) {
    return svc.setEnabled(id, enabled);
  }

  // FE của bạn đang gửi body là mảng ["USER","ADMIN"], nên nhận List<String>
  @PostMapping("/{id}/roles")
  public UserResponse setRoles(@PathVariable Long id, @RequestBody List<String> roles) {
    return svc.setRoles(id, roles);
  }
}
