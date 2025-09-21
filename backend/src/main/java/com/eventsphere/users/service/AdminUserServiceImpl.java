package com.eventsphere.users.service;

import com.eventsphere.core.exception.NotFoundException;
import com.eventsphere.users.dto.AdminUserDtos.*;
import com.eventsphere.users.model.User;
import com.eventsphere.users.repo.RoleRepository;
import com.eventsphere.users.repo.UserRepository;
import com.eventsphere.security.Role;
import jakarta.persistence.criteria.JoinType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

  private final UserRepository userRepo;
  private final RoleRepository roleRepo;
  private final PasswordEncoder passwordEncoder;

  @Override @Transactional
  public Page<UserResponse> list(String q, String role, Pageable pageable) {
    Specification<User> spec = (root, cq, cb) -> {
      var p = cb.conjunction();
      if (q != null && !q.isBlank()) {
        var like = "%" + q.trim().toLowerCase() + "%";
        p = cb.and(p, cb.or(
          cb.like(cb.lower(root.get("email")), like),
          cb.like(cb.lower(root.get("fullName")), like)
        ));
      }
      if (role != null && !role.isBlank()) {
        var join = root.join("roles", JoinType.LEFT);
        p = cb.and(p, cb.equal(join.get("roleName"), role));
        cq.distinct(true);
      }
      return p;
    };
    return userRepo.findAll(spec, pageable).map(this::map);
  }

  @Override @Transactional
  public UserResponse create(CreateUserRequest req) {
    if (userRepo.existsByEmail(req.email())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
    }
    var u = new User();
    u.setEmail(req.email().trim());
    u.setFullName(req.fullName().trim());
    u.setEnabled(req.enabled());
    u.setPasswordHash(passwordEncoder.encode(req.password()));

    var requested = (req.roles() == null || req.roles().isEmpty()) ? List.of("USER") : req.roles();
    var roleEntities = roleRepo.findByRoleNameIn(requested);
    if (roleEntities.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid roles");
    u.setRoles(new HashSet<>(roleEntities));

    userRepo.save(u);
    return map(u);
  }

  @Override @Transactional
  public UserResponse update(Long id, UpdateUserRequest req) {
    var u = userRepo.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    if (req.fullName() != null) u.setFullName(req.fullName().trim());
    if (req.enabled()  != null) u.setEnabled(req.enabled());
    return map(u);
  }

  @Override @Transactional
  public void delete(Long id) {
    if (!userRepo.existsById(id)) throw new NotFoundException("User not found");
    userRepo.deleteById(id);
  }

  @Override @Transactional
  public UserResponse setEnabled(Long id, boolean enabled) {
    var u = userRepo.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    u.setEnabled(enabled);
    return map(u);
  }

  @Override @Transactional
  public UserResponse setRoles(Long id, List<String> roles) {
    var u = userRepo.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    var rs = (roles == null || roles.isEmpty()) ? List.of("USER") : roles;
    var roleEntities = roleRepo.findByRoleNameIn(rs);
    if (roleEntities.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid roles");
    u.setRoles(new HashSet<>(roleEntities));
    return map(u);
  }

  private UserResponse map(User u) {
    List<String> rs = u.getRoles().stream().map(Role::getRoleName).sorted().collect(Collectors.toList());
    return new UserResponse(u.getUserId(), u.getEmail(), u.getFullName(), u.isEnabled(), rs);
  }
}
