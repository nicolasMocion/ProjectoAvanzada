package com.ProgramacionAvanzada.GestionSolicitudes.dto.response;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.AccionHistorial;
import java.time.LocalDateTime;
import java.util.UUID;

public record HistorialAccionResponse(
        UUID id,
        UUID solicitudId,
        AccionHistorial accion,
        UsuarioResumenResponse usuario,
        LocalDateTime timestamp,
        String observacion) {
}
