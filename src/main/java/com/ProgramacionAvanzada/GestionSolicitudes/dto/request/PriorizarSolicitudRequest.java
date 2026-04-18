package com.ProgramacionAvanzada.GestionSolicitudes.dto.request;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.PrioridadNivel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PriorizarSolicitudRequest(
        @NotNull PrioridadNivel prioridad,
        @NotBlank @Size(max = 500) String justificacion) {
}
