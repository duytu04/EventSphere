package com.eventsphere.users.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventsphere.users.dto.AuthDtos.LoginRequest;
import com.eventsphere.users.dto.AuthDtos.ProfileResponse;
import com.eventsphere.users.dto.AuthDtos.SignupRequest;
import com.eventsphere.users.dto.AuthDtos.Tokens;
import com.eventsphere.users.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  private final UserService users;

  @PostMapping("/signup")
  public ProfileResponse signup(@Valid @RequestBody SignupRequest req){
    return users.signup(req);
  }

  @PostMapping("/login")
  public Tokens login(@RequestBody LoginRequest req){
    return users.login(req);
  }

  @GetMapping("/me")
  public ProfileResponse me(){
    return users.me();
  }
}
