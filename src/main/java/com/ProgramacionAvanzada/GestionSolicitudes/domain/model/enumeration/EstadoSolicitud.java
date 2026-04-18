package com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.EnumSet;
import java.util.Set;

public enum EstadoSolicitud {
    REGISTRADA("registrada"),
    CLASIFICADA("clasificada"),
    EN_ATENCION("en_atencion"),
    ATENDIDA("atendida"),
    CERRADA("cerrada");

    private final String value;

    EstadoSolicitud(String value) {
        this.value = value;
    }

    public boolean canTransitionTo(EstadoSolicitud target) {
        return allowedTransitions().contains(target);
    }

    private Set<EstadoSolicitud> allowedTransitions() {
        return switch (this) {
            case REGISTRADA -> EnumSet.of(CLASIFICADA);
            case CLASIFICADA -> EnumSet.of(EN_ATENCION, CERRADA);
            case EN_ATENCION -> EnumSet.of(ATENDIDA, CERRADA);
            case ATENDIDA -> EnumSet.of(CERRADA);
            case CERRADA -> EnumSet.noneOf(EstadoSolicitud.class);
        };
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static EstadoSolicitud fromValue(String value) {
        for (EstadoSolicitud estado : values()) {
            if (estado.value.equalsIgnoreCase(value)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado no soportado: " + value);
    }
}
