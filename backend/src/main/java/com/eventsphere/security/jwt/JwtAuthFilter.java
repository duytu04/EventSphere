package com.eventsphere.security.jwt;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
        var jws = jwt.parse(token);
        String email = jws.getBody().getSubject();
        var u = users.findByEmail(email).orElse(null);
        if (u != null && u.isEnabled()) {
          var auth = new UsernamePasswordAuthenticationToken(
              email,
              null,
              u.getRoles().stream()
                  .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getRoleName()))
                  .toList()
          );
          SecurityContextHolder.getContext().setAuthentication(auth);
        }
      } catch (Exception ignored) {}
    }
    chain.doFilter(req, res);
  }
}
