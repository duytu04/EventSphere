
// package com.eventsphere.config;

// import java.util.List;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.http.HttpMethod;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// import org.springframework.web.cors.CorsConfiguration;

// import com.eventsphere.security.jwt.JwtAuthFilter;

// import lombok.RequiredArgsConstructor;

// @Configuration
// @EnableMethodSecurity
// @RequiredArgsConstructor
// public class SecurityConfig {
//   private final JwtAuthFilter jwt;

//   @Value("${cors.allowed-origins:http://localhost:5173}")
//   private String allowedOrigins;

//   @Bean
//   SecurityFilterChain filter(HttpSecurity http) throws Exception {
//     http
//       // Tắt mấy thứ mặc định để khỏi va chạm
//       .httpBasic(h -> h.disable())
//       .formLogin(f -> f.disable())
//       .logout(l -> l.disable())

//       .csrf(cs -> cs.disable())
//       .cors(cors -> cors.configurationSource(_ -> {
//         CorsConfiguration c = new CorsConfiguration();
//         c.setAllowedOrigins(List.of(allowedOrigins.split(",")));
//         c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
//         c.setAllowedHeaders(List.of("*"));
//         c.setAllowCredentials(true);
//         return c;
//       }))
//       .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//       .authorizeHttpRequests(auth -> auth
//         // Cho phép preflight
//         .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//         // Public
//         .requestMatchers("/api/auth/**").permitAll()
//         .requestMatchers(HttpMethod.GET, "/api/ping").permitAll()
//         .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
//         .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
//         .requestMatchers("/api/public/**").permitAll()
//         .requestMatchers("/api/organizer/**").hasRole("ORGANIZER")
//         // Admin
//         .requestMatchers("/api/admin/**").hasRole("ADMIN")
//         // Còn lại cần JWT
//         .requestMatchers("/error").permitAll()

//         .anyRequest().authenticated()
//       )
//       // JWT trước UsernamePasswordAuthenticationFilter
//       .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)
//       // Trả 401/403 rõ ràng
//       .exceptionHandling(eh -> eh
//         .authenticationEntryPoint((req, res, ex) -> res.sendError(401, "Unauthorized"))
//         .accessDeniedHandler((req, res, ex) -> res.sendError(403, "Forbidden"))
//       );

//     return http.build();
//   }

//   @Bean PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }

//   @Bean
//   AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
//     return config.getAuthenticationManager();
//   }
// }



package com.eventsphere.config;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.cors.CorsConfiguration;

import com.eventsphere.security.jwt.JwtAuthFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
  private final JwtAuthFilter jwt;

  @Value("${cors.allowed-origins:http://localhost:5173}")
  private String allowedOrigins;

  @Bean
  SecurityFilterChain filter(HttpSecurity http) throws Exception {
    http
      // Tắt mấy thứ mặc định để khỏi va chạm
      .httpBasic(h -> h.disable())
      .formLogin(f -> f.disable())
      .logout(l -> l.disable())

      .csrf(cs -> cs.disable())
      .cors(cors -> cors.configurationSource(_ -> {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setAllowCredentials(true);
        return c;
      }))
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
        // Cho phép preflight
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
        // Public
        .requestMatchers("/api/auth/**").permitAll()
       
        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
        .requestMatchers("/api/public/**").permitAll()
        // Organizer-only
        .requestMatchers("/api/organizer/**").hasRole("ORGANIZER")
        // Admin-only
        .requestMatchers("/api/admin/**").hasRole("ADMIN")
        // Còn lại cần JWT
        .requestMatchers("/error").permitAll()
        .anyRequest().authenticated()
      )
      // JWT trước UsernamePasswordAuthenticationFilter
      .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)
      // Trả 401/403 rõ ràng
      .exceptionHandling(eh -> eh
        .authenticationEntryPoint((req, res, ex) -> res.sendError(401, "Unauthorized"))
        .accessDeniedHandler((req, res, ex) -> res.sendError(403, "Forbidden"))
      );

    return http.build();
  }

  @Bean PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
  }

  /* =======================
     Embedded test endpoints
     ======================= */

  /** Public ping để kiểm tra server */
  @RestController
  @RequestMapping("/api")
  public static class PingController {
    @GetMapping("/ping")
    public Map<String, Object> ping() {
      return Map.of("pong", true);
    }
  }

  /** Ai đang đăng nhập? (yêu cầu đã qua JWT vì rule chung là authenticated) */
  @RestController
  @RequestMapping("/api")
  public static class WhoAmIController {
    @GetMapping("/whoami")
    public Map<String, Object> whoami(Authentication auth) {
      if (auth == null) return Map.of("authenticated", false);
      return Map.of(
          "authenticated", true,
          "name", auth.getName(),
          "principal", auth.getPrincipal(),
          "authorities", auth.getAuthorities()
      );
    }
  }

  /** Nhóm endpoint thử bảo vệ theo role */
  @RestController
  @RequestMapping("/api/secure")
  public static class SecureProbeController {

    /** chỉ cần authenticated */
    @GetMapping("/probe")
    public Map<String, Object> probe(Authentication auth) {
      return Map.of("ok", true, "user", auth != null ? auth.getName() : null);
    }

    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> adminOnly(Authentication auth) {
      return Map.of("ok", true, "scope", "ADMIN", "user", auth.getName());
    }

    @GetMapping("/organizer-only")
    @PreAuthorize("hasRole('ORGANIZER')")
    public Map<String, Object> organizerOnly(Authentication auth) {
      return Map.of("ok", true, "scope", "ORGANIZER", "user", auth.getName());
    }

    @GetMapping("/student-only")
    @PreAuthorize("hasRole('STUDENT')")
    public Map<String, Object> studentOnly(Authentication auth) {
      return Map.of("ok", true, "scope", "STUDENT", "user", auth.getName());
    }
  }
}
