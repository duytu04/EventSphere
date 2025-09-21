package com.eventsphere.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class AdminUserDtos {

  public record CreateUserRequest(
      @Email String email,
      @NotBlank String fullName,
      @Size(min = 6) String password,
      boolean enabled,
      List<String> roles // ["USER","ORGANIZER","ADMIN"]
  ) {}

  public record UpdateUserRequest(
      String fullName,
      Boolean enabled
  ) {}

  public record UserResponse(
      Long id,
      String email,
      String fullName,
      boolean enabled,
      List<String> roles
  ) {}
}
