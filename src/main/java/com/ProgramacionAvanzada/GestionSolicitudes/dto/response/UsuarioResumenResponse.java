package com.ProgramacionAvanzada.GestionSolicitudes.dto.response;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.RolUsuario;
import java.util.UUID;

public record UsuarioResumenResponse(
        UUID id,
        String nombre,
        RolUsuario rol) {
}
