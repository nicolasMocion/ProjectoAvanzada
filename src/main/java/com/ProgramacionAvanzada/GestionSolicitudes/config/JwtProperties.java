package com.ProgramacionAvanzada.GestionSolicitudes.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propiedades JWT en el archivo application.properties.
 * @author desuu03
 * @version 1.0
 */


@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(
        String secret,
        String issuer,
        Duration accessTokenTtl) {
}
