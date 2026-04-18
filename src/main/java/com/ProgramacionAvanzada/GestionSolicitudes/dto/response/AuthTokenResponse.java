package com.ProgramacionAvanzada.GestionSolicitudes.dto.response;

import java.time.Instant;

public record AuthTokenResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt,
        UsuarioResumenResponse usuario) {
}
