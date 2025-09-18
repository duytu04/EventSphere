// package com.eventsphere.security;

// import java.util.Collection;
// import java.util.Objects;

// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.GrantedAuthority;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.stereotype.Component;

// import com.eventsphere.users.repo.UserRepository;

// /** Tiện ích đọc user hiện tại từ SecurityContext. */
// @Component
// public class AuthFacade {

//   private final UserRepository users;

//   public AuthFacade(UserRepository users) {
//     this.users = users;
//   }

//   /** Email (subject) hiện tại, hoặc null nếu anonymous. */
//   public String currentUserEmail() {
//     Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//     if (auth == null || !auth.isAuthenticated()) return null;
//     Object principal = auth.getPrincipal();
//     // JwtAuthFilter đã set principal = email (String)
//     return (principal instanceof String) ? (String) principal : null;
//   }

//   /** userId hiện tại (tra DB theo email), hoặc null nếu anonymous/không tìm thấy. */
//   public Long currentUserId() {
//     String email = currentUserEmail();
//     if (email == null) return null;
//     return users.findByEmail(email).map(u -> u.getUserId()).orElse(null);
//   }

//   /** Có ROLE_xxx hay không. */
//   public boolean hasRole(String roleName) {
//     Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//     if (auth == null) return false;
//     Collection<? extends GrantedAuthority> as = auth.getAuthorities();
//     if (as == null) return false;
//     String target = "ROLE_" + Objects.toString(roleName, "").toUpperCase();
//     return as.stream().anyMatch(a -> target.equalsIgnoreCase(a.getAuthority()));
//   }
// }
package com.eventsphere.security;

import java.lang.reflect.Method;
import java.util.Collection;
import java.util.Objects;
import java.util.Optional;

import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.eventsphere.users.repo.UserRepository;

@Component
public class AuthFacade {
  private final UserRepository users;

  public AuthFacade(UserRepository users) {
    this.users = users;
  }

  /** Trả về email (principal) hiện tại, hoặc null nếu anonymous. */
  @Nullable
  public String currentUserEmail() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) return null;
    Object p = auth.getPrincipal();
    return (p instanceof String s) ? s : null; // JwtAuthFilter set principal = email (String)
  }

  /**
   * Lấy userId hiện tại qua email, chấp nhận entity có getter khác nhau:
   * - getUserId() hoặc getId()
   * - nếu không có, trả null.
   */
  @Nullable
  public Long currentUserId() {
    String email = currentUserEmail();
    if (email == null) return null;
    return users.findByEmail(email)
        .flatMap(u -> tryGetId(u))
        .orElse(null);
  }

  private Optional<Long> tryGetId(Object u) {
    // thứ tự ưu tiên: getUserId() -> getId()
    Long id = invokeLongGetter(u, "getUserId");
    if (id != null) return Optional.of(id);
    id = invokeLongGetter(u, "getId");
    return Optional.ofNullable(id);
  }

  private Long invokeLongGetter(Object target, String method) {
    try {
      Method m = target.getClass().getMethod(method);
      Object v = m.invoke(target);
      if (v == null) return null;
      if (v instanceof Long l) return l;
      if (v instanceof Number n) return n.longValue(); // phòng khi id là Integer
      // Nếu kiểu khác (String, v.v.) thì thử parse
      try { return Long.parseLong(v.toString()); } catch (NumberFormatException ignore) { return null; }
    } catch (ReflectiveOperationException ignore) {
      return null;
    }
  }

  /** Kiểm tra quyền ROLE_xxx hiện tại. */
  public boolean hasRole(String roleName) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null) return false;
    Collection<? extends GrantedAuthority> as = auth.getAuthorities();
    if (as == null) return false;
    String target = "ROLE_" + Objects.toString(roleName, "").toUpperCase();
    return as.stream().anyMatch(a -> target.equalsIgnoreCase(a.getAuthority()));
  }
}


