package com.eventsphere.users.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventsphere.security.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
  Optional<Role> findByRoleName(String name);
}
