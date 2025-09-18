package com.eventsphere.users.service;

import com.eventsphere.users.dto.AuthDtos.LoginRequest;
import com.eventsphere.users.dto.AuthDtos.ProfileResponse;
import com.eventsphere.users.dto.AuthDtos.SignupRequest;
import com.eventsphere.users.dto.AuthDtos.Tokens;

public interface UserService {
  ProfileResponse signup(SignupRequest req);
  Tokens login(LoginRequest req);
  ProfileResponse me();
}
