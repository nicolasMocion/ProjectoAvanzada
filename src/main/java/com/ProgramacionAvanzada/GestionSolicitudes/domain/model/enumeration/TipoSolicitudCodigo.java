package com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum TipoSolicitudCodigo {
    REGISTRO_ASIGNATURAS,
    HOMOLOGACION,
    CANCELACION,
    SOLICITUD_CUPO,
    CONSULTA_ACADEMICA,
    OTRO;

    @JsonCreator
    public static TipoSolicitudCodigo fromValue(String value) {
        for (TipoSolicitudCodigo tipo : values()) {
            if (tipo.name().equalsIgnoreCase(value)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Tipo de solicitud no soportado: " + value);
    }
}
