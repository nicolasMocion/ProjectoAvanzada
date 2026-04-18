package com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RolUsuario {
    ESTUDIANTE("estudiante"),
    OPERADOR("operador"),
    ADMINISTRADOR("administrador"),
    DOCENTE("docente");

    private final String value;

    RolUsuario(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static RolUsuario fromValue(String value) {
        for (RolUsuario rol : values()) {
            if (rol.value.equalsIgnoreCase(value)) {
                return rol;
            }
        }
        throw new IllegalArgumentException("Rol no soportado: " + value);
    }
}
