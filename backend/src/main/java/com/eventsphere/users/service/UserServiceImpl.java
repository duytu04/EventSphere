package com.eventsphere.users.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.eventsphere.security.Role;
import com.eventsphere.security.jwt.JwtService;
import com.eventsphere.users.dto.AuthDtos.LoginRequest;
import com.eventsphere.users.dto.AuthDtos.ProfileResponse;
import com.eventsphere.users.dto.AuthDtos.SignupRequest;
import com.eventsphere.users.dto.AuthDtos.Tokens;
import com.eventsphere.users.model.User;
import com.eventsphere.users.repo.RoleRepository;
import com.eventsphere.users.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
  private final UserRepository users;
  private final RoleRepository roles;
  private final PasswordEncoder pe;
  private final JwtService jwt;

  @Override
  @Transactional
  public ProfileResponse signup(SignupRequest req){
    String email = req.email().trim().toLowerCase();
    if (users.findByEmail(email).isPresent())
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email exists");
    User user = new User();
    user.setEmail(email);
    user.setFullName(req.fullName());
    user.setPasswordHash(pe.encode(req.password()));
    user.getRoles().add(roles.findByRoleName("USER").orElseThrow());
    users.save(user);
    return new ProfileResponse(user.getUserId(), user.getEmail(), user.getFullName(), List.of("USER"));
  }

  @Override
  public Tokens login(LoginRequest req){
    String email = req.email().trim().toLowerCase();
    var u = users.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bad credentials"));
    if (!pe.matches(req.password(), u.getPasswordHash()))
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bad credentials");
    var token = jwt.generate(u.getEmail(), u.getRoles().stream().map(Role::getRoleName).toList());
    return new Tokens(token);
  }

  @Override
  public ProfileResponse me(){
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String email = (String) auth.getPrincipal();
    var u = users.findByEmail(email).orElseThrow();
    var roles = u.getRoles().stream().map(Role::getRoleName).toList();
    return new ProfileResponse(u.getUserId(), u.getEmail(), u.getFullName(), roles);
  }
}
