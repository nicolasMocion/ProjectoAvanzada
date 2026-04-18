package com.ProgramacionAvanzada.GestionSolicitudes.dto.request;

import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record ActualizarSolicitudRequest(
        @Size(max = 2000) String descripcion,
        LocalDateTime fechaLimite) {
}
