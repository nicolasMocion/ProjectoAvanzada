package com.ProgramacionAvanzada.GestionSolicitudes.dto.request;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.RolUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record ActualizarUsuarioRequest(
        @Size(max = 30) String identificacion,
        @Size(max = 120) String nombre,
        @Email @Size(max = 120) String email,
        @Size(min = 8, max = 255) String password,
        RolUsuario rol,
        Boolean activo) {
}
