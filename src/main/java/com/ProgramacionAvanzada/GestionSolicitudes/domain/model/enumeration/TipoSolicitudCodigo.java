package com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TipoSolicitudCodigo {
    REGISTRO_ASIGNATURAS("registro_asignaturas"),
    HOMOLOGACION("homologacion"),
    CANCELACION("cancelacion"),
    SOLICITUD_CUPO("solicitud_cupo"),
    CONSULTA_ACADEMICA("consulta_academica"),
    OTRO("otro");

    private final String value;

    TipoSolicitudCodigo(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static TipoSolicitudCodigo fromValue(String value) {
        for (TipoSolicitudCodigo tipo : values()) {
            if (tipo.value.equalsIgnoreCase(value)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Tipo de solicitud no soportado: " + value);
    }
}
