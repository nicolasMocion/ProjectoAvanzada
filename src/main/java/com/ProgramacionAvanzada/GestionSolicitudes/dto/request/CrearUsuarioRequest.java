package com.ProgramacionAvanzada.GestionSolicitudes.dto.request;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.RolUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearUsuarioRequest(
        @NotBlank(message = "La identificacion es obligatoria.") @Size(max = 30, message = "La identificacion debe tener maximo 30 caracteres.") String identificacion,
        @NotBlank(message = "El nombre es obligatorio.") @Size(max = 120, message = "El nombre debe tener maximo 120 caracteres.") String nombre,
        @NotBlank(message = "El email es obligatorio.") @Email(message = "Debe ingresar un email valido.") @Size(max = 120, message = "El email debe tener maximo 120 caracteres.") String email,
        @NotBlank(message = "La contrasena es obligatoria.") @Size(min = 8, max = 255, message = "La contrasena debe tener entre 8 y 255 caracteres.") String password,
        @NotNull(message = "El rol es obligatorio.") RolUsuario rol) {
}
