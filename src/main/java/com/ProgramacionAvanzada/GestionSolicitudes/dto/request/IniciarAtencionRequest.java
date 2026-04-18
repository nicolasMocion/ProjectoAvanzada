package com.ProgramacionAvanzada.GestionSolicitudes.dto.request;

import jakarta.validation.constraints.Size;

public record IniciarAtencionRequest(
        @Size(max = 500) String observacion) {
}
