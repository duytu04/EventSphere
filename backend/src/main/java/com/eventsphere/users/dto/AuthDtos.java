package com.eventsphere.users.dto;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {
  private AuthDtos(){}

  public record LoginRequest(String email, String password) {}
  public record SignupRequest(@NotBlank @Email String email,
                              @NotBlank String password,
                              @NotBlank String fullName) {}
  public record Tokens(String accessToken) {}
  public record ProfileResponse(Long userId, String email, String fullName, List<String> roles) {}
}
