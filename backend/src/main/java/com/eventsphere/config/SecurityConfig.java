


package com.eventsphere.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
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
        .requestMatchers(HttpMethod.GET, "/api/ping").permitAll()
        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
        // Admin
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
}
