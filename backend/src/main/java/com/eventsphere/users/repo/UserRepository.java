package com.eventsphere.users.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventsphere.users.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
}
