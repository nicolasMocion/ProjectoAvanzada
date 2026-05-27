package com.ProgramacionAvanzada.GestionSolicitudes.dto.request;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.RolUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearUsuarioRequest(
        @NotBlank @Size(max = 30) String identificacion,
        @NotBlank @Size(max = 120) String nombre,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(min = 8, max = 255) String password,
        @NotNull RolUsuario rol) {
}
