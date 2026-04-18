package com.ProgramacionAvanzada.GestionSolicitudes.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record AsignarSolicitudRequest(
        @NotNull UUID responsableId,
        @Size(max = 500) String observacion) {
}
