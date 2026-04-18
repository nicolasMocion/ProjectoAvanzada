package com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AccionHistorial {
    REGISTRAR("registrar"),
    CLASIFICAR("clasificar"),
    PRIORIZAR("priorizar"),
    ASIGNAR("asignar"),
    INICIAR_ATENCION("iniciar_atencion"),
    RESOLVER("resolver"),
    CERRAR("cerrar"),
    ACTUALIZAR("actualizar");

    private final String value;

    AccionHistorial(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static AccionHistorial fromValue(String value) {
        for (AccionHistorial accion : values()) {
            if (accion.value.equalsIgnoreCase(value)) {
                return accion;
            }
        }
        throw new IllegalArgumentException("Accion no soportada: " + value);
    }
}
