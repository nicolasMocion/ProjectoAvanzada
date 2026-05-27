package com.ProgramacionAvanzada.GestionSolicitudes.dto.response;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.RolUsuario;
import java.util.UUID;

public record UsuarioResponse(
        UUID id,
        String identificacion,
        String nombre,
        String email,
        RolUsuario rol,
        Boolean activo) {
}
