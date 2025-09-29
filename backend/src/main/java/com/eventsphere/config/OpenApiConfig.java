package com.eventsphere.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI openApi(@Value("${spring.application.name:EventSphere}") String appName) {
    return new OpenAPI()
        .info(new Info()
            .title(appName + " API")
            .version("1.0.0")
            .description("REST API for the EventSphere platform")
            .contact(new Contact().name("EventSphere Team").email("support@eventsphere.local")));
  }
}
