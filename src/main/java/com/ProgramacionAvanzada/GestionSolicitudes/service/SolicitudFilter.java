package com.ProgramacionAvanzada.GestionSolicitudes.service;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.EstadoSolicitud;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.PrioridadNivel;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.TipoSolicitudCodigo;
import java.util.UUID;

public record SolicitudFilter(
        EstadoSolicitud estado,
        TipoSolicitudCodigo tipo,
        PrioridadNivel prioridad,
        UUID responsableId) {
}
