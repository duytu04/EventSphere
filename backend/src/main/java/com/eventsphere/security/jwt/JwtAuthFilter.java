// package com.eventsphere.security.jwt;

// import java.io.IOException;

// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.stereotype.Component;
// import org.springframework.web.filter.OncePerRequestFilter;

// import com.eventsphere.users.repo.UserRepository;

// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import lombok.RequiredArgsConstructor;

// @Component
// @RequiredArgsConstructor
// public class JwtAuthFilter extends OncePerRequestFilter {
//   private final JwtService jwt;
//   private final UserRepository users;

//   @Override
//   protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
//       throws ServletException, IOException {
//     String h = req.getHeader("Authorization");
//     if (h != null && h.startsWith("Bearer ")) {
//       String token = h.substring(7);
//       try {
//         var jws = jwt.parse(token);
//         String email = jws.getBody().getSubject();
//         var u = users.findByEmail(email).orElse(null);
//         if (u != null && u.isEnabled()) {
//           var auth = new UsernamePasswordAuthenticationToken(
//               email,
//               null,
//               u.getRoles().stream()
//                   .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getRoleName()))
//                   .toList()
//           );
//           SecurityContextHolder.getContext().setAuthentication(auth);
//         }
//       } catch (Exception ignored) {}
//     }
//     chain.doFilter(req, res);
//   }
// }
package com.eventsphere.security.jwt;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.eventsphere.users.repo.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtService jwt;
  private final UserRepository users;

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {

    String h = req.getHeader("Authorization");
    if (h != null && h.startsWith("Bearer ")) {
      String token = h.substring(7);
      try {
        var claims = jwt.parse(token);
        String email = claims.getSubject();

        var u = users.findByEmail(email).orElse(null);
        if (u != null) {
          // 1) enabled: mặc định true; thử gọi getEnabled()/isEnabled() nếu có
          boolean enabled = true;
          try {
            Method m;
            try {
              m = u.getClass().getMethod("getEnabled");
            } catch (NoSuchMethodException ex) {
              m = u.getClass().getMethod("isEnabled");
            }
            Object val = m.invoke(u);
            if (val instanceof Boolean b) enabled = b;
          } catch (ReflectiveOperationException ignore) {
            // không có getter -> giữ enabled = true
          }

          if (enabled) {
            // 2) authorities: cố gắng lấy getRoles(); nếu không có thì để rỗng
            var authorities = new ArrayList<GrantedAuthority>();
            try {
              Object rolesObj = u.getClass().getMethod("getRoles").invoke(u);
              if (rolesObj instanceof Collection<?> rs) {
                for (Object r : rs) {
                  String roleName;
                  try {
                    // ưu tiên phương thức getRoleName()
                    roleName = (String) r.getClass().getMethod("getRoleName").invoke(r);
                  } catch (ReflectiveOperationException ex1) {
                    try {
                      // fallback: getName()
                      roleName = (String) r.getClass().getMethod("getName").invoke(r);
                    } catch (ReflectiveOperationException ex2) {
                      // chót: toString()
                      roleName = String.valueOf(r);
                    }
                  }
                  // chuẩn hoá tiền tố ROLE_
                  String authName = roleName != null ? roleName.trim() : "";
                  if (!authName.startsWith("ROLE_")) authName = "ROLE_" + authName;
                  authorities.add(new SimpleGrantedAuthority(authName));
                }
              }
            } catch (ReflectiveOperationException ignore) {
              // không có roles -> authorities rỗng
            }

            var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);
          }
        }
      } catch (Exception ignored) {
        // token lỗi / hết hạn -> bỏ qua, để các rule trả 401/403 như cũ
        SecurityContextHolder.clearContext();
      }
    }
    chain.doFilter(req, res);
  }
}


