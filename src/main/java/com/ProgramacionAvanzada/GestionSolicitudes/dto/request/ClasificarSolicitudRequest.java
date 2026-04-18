package com.ProgramacionAvanzada.GestionSolicitudes.dto.request;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.TipoSolicitudCodigo;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClasificarSolicitudRequest(
        @NotNull TipoSolicitudCodigo tipo,
        @Size(max = 500) String observacion) {
}
