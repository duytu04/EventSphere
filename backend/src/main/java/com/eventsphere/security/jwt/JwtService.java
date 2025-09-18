package com.eventsphere.security.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {
  @Value("${jwt.secret}") private String secret;
  @Value("${jwt.expiration}") private long expirationSec;

  public String generate(String subject, List<String> roles){
    Date now = new Date();
    Date exp = new Date(now.getTime() + expirationSec * 1000);
    return Jwts.builder()
      .setSubject(subject)
      .claim("roles", roles)
      .setIssuedAt(now)
      .setExpiration(exp)
      .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
      .compact();
  }

  public Jws<Claims> parse(String token){
    return Jwts.parserBuilder()
      .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
      .build()
      .parseClaimsJws(token);
  }
}
