package com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PrioridadNivel {
    BAJA,
    MEDIA,
    ALTA,
    URGENTE;

    @JsonCreator
    public static PrioridadNivel fromValue(String value) {
        for (PrioridadNivel prioridad : values()) {
            if (prioridad.name().equalsIgnoreCase(value)) {
                return prioridad;
            }
        }
        throw new IllegalArgumentException("Prioridad no soportada: " + value);
    }
}
