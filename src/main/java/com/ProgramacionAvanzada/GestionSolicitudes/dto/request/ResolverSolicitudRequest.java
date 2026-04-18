package com.ProgramacionAvanzada.GestionSolicitudes.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResolverSolicitudRequest(
        @NotBlank @Size(max = 2000) String respuesta) {
}
