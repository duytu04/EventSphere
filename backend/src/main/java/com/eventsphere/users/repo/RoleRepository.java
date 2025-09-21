package com.eventsphere.users.repo;

import com.eventsphere.security.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
  Optional<Role> findByRoleName(String name);
  List<Role> findByRoleNameIn(List<String> names);
}
