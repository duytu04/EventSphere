package com.eventsphere.security;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity @Table(name="roles")
@Getter @Setter @NoArgsConstructor
public class Role {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long roleId;

  @Column(nullable=false, unique=true, length=32)
  private String roleName; // ADMIN, ORGANIZER, USER
}
