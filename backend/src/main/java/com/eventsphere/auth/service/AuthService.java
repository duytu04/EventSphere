package com.eventsphere.auth.service;

import com.eventsphere.auth.dto.AuthDtos;
import com.eventsphere.security.Role;
import com.eventsphere.security.jwt.JwtService;
import com.eventsphere.users.model.User;
import com.eventsphere.users.repo.UserRepository;
import com.eventsphere.users.repo.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        // Get user details
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify password
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Check if user is enabled
        if (!user.isEnabled()) {
            throw new RuntimeException("User account is disabled");
        }

        // Generate JWT token
        String token = jwtService.generate(
            user.getEmail(), 
            user.getRoles().stream()
                .map(role -> (GrantedAuthority) () -> "ROLE_" + role.getRoleName())
                .toList()
        );

        return new AuthDtos.AuthResponse(
            token, // This will be mapped to accessToken field
            user.getEmail(),
            user.getFullName(),
            user.getRoles() != null ? user.getRoles().stream()
                .map(Role::getRoleName)
                .toList() : List.of(),
            user.getUserId()
        );
    }

    public AuthDtos.AuthResponse signup(AuthDtos.SignupRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setEnabled(true);

        // Assign USER role by default
        Role userRole = roleRepository.findByRoleName("USER")
            .orElseThrow(() -> new RuntimeException("USER role not found"));
        user.setRoles(Set.of(userRole));

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = jwtService.generate(
            savedUser.getEmail(),
            savedUser.getRoles().stream()
                .map(role -> (GrantedAuthority) () -> "ROLE_" + role.getRoleName())
                .toList()
        );

        return new AuthDtos.AuthResponse(
            token, // This will be mapped to accessToken field
            savedUser.getEmail(),
            savedUser.getFullName(),
            savedUser.getRoles().stream()
                .map(Role::getRoleName)
                .toList(),
            savedUser.getUserId()
        );
    }

    @Transactional(readOnly = true)
    public AuthDtos.MeResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthDtos.MeResponse(
            user.getEmail(),
            user.getFullName(),
            user.getRoles().stream()
                .map(Role::getRoleName)
                .toList(),
            user.getUserId(),
            user.isEnabled()
        );
    }
}
