package com.eventsphere.users.repo;

import com.eventsphere.users.model.User;                    // <— import entity User
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // <— nếu bạn dùng search/filter
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository
    extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> { // <— User được resolve

  Optional<User> findByEmail(String email);
  boolean existsByEmail(String email);

  @Query("SELECT r.roleName AS role, COUNT(u) AS count FROM User u JOIN u.roles r GROUP BY r.roleName")
  List<RoleCount> countUsersByRole();

  interface RoleCount {
    String getRole();
    long getCount();
  }
}
