package com.eventsphere.users.repo;

import com.eventsphere.users.model.User;                    // <— import entity User
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // <— nếu bạn dùng search/filter
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository
    extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> { // <— User được resolve

  Optional<User> findByEmail(String email);
  boolean existsByEmail(String email);
}
