package com.ProgramacionAvanzada.GestionSolicitudes.dto.request;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.CanalOrigen;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.TipoSolicitudCodigo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.UUID;

public record CrearSolicitudRequest(
        @NotNull TipoSolicitudCodigo tipo,
        @NotBlank @Size(max = 2000) String descripcion,
        @NotNull CanalOrigen canalOrigen,
        @NotNull UUID solicitanteId,
        LocalDateTime fechaLimite) {
}
