package com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum AccionHistorial {
    REGISTRAR,
    CLASIFICAR,
    PRIORIZAR,
    ASIGNAR,
    INICIAR_ATENCION,
    RESOLVER,
    CERRAR,
    ACTUALIZAR,
    ELIMINAR;

    @JsonCreator
    public static AccionHistorial fromValue(String value) {
        for (AccionHistorial accion : values()) {
            if (accion.name().equalsIgnoreCase(value)) {
                return accion;
            }
        }
        throw new IllegalArgumentException("Accion no soportada: " + value);
    }
}
