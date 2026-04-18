package com.ProgramacionAvanzada.GestionSolicitudes.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CerrarSolicitudRequest(
        @NotBlank @Size(max = 1000) String observacionCierre) {
}
