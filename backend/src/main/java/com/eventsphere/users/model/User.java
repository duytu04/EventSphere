package com.eventsphere.users.model;

import com.eventsphere.security.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity @Table(name="users")
@Getter @Setter @NoArgsConstructor
public class User {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long userId;

  @Column(nullable=false, unique=true, length=120)
  private String email;

  @Column(nullable=false, length=255)
  private String passwordHash;

  private String fullName;

  @Column(nullable=false)
  private boolean enabled = true;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(name="user_roles",
      joinColumns=@JoinColumn(name="user_id"),
      inverseJoinColumns=@JoinColumn(name="role_id"))
  private Set<Role> roles = new HashSet<>();

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  @PrePersist void onCreate(){ createdAt = updatedAt = LocalDateTime.now(); }
  @PreUpdate  void onUpdate(){ updatedAt = LocalDateTime.now(); }
}
