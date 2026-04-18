package com.ProgramacionAvanzada.GestionSolicitudes.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(
        String secret,
        String issuer,
        Duration accessTokenTtl) {
}
