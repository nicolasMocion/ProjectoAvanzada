package com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PrioridadNivel {
    BAJA("baja"),
    MEDIA("media"),
    ALTA("alta"),
    URGENTE("urgente");

    private final String value;

    PrioridadNivel(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static PrioridadNivel fromValue(String value) {
        for (PrioridadNivel prioridad : values()) {
            if (prioridad.value.equalsIgnoreCase(value)) {
                return prioridad;
            }
        }
        throw new IllegalArgumentException("Prioridad no soportada: " + value);
    }
}
