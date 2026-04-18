package com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum CanalOrigen {
    CSU("csu"),
    CORREO("correo"),
    SAC("sac"),
    TELEFONICO("telefonico"),
    PRESENCIAL("presencial"),
    OTRO("otro");

    private final String value;

    CanalOrigen(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static CanalOrigen fromValue(String value) {
        for (CanalOrigen canal : values()) {
            if (canal.value.equalsIgnoreCase(value)) {
                return canal;
            }
        }
        throw new IllegalArgumentException("Canal de origen no soportado: " + value);
    }
}
