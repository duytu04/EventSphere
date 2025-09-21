package com.eventsphere.users.service;

import com.eventsphere.users.dto.AdminUserDtos.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AdminUserService {
  Page<UserResponse> list(String q, String role, Pageable pageable);
  UserResponse create(CreateUserRequest req);
  UserResponse update(Long id, UpdateUserRequest req);
  void delete(Long id);
  UserResponse setEnabled(Long id, boolean enabled);
  UserResponse setRoles(Long id, List<String> roles);
}
