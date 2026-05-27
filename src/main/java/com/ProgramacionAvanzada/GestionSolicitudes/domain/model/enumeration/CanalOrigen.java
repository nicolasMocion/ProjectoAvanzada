package com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum CanalOrigen {
    CSU,
    CORREO,
    SAC,
    TELEFONICO,
    PRESENCIAL,
    OTRO;

    @JsonCreator
    public static CanalOrigen fromValue(String value) {
        for (CanalOrigen canal : values()) {
            if (canal.name().equalsIgnoreCase(value)) {
                return canal;
            }
        }
        throw new IllegalArgumentException("Canal de origen no soportado: " + value);
    }
}
