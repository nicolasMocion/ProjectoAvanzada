package com.ProgramacionAvanzada.GestionSolicitudes.dto.response;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.CanalOrigen;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.EstadoSolicitud;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.PrioridadNivel;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.TipoSolicitudCodigo;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitudResponse(
        UUID id,
        TipoSolicitudCodigo tipo,
        String descripcion,
        CanalOrigen canalOrigen,
        LocalDateTime timestamp,
        UsuarioResumenResponse solicitante,
        String solicitanteNombre,
        String solicitanteIdentificacion,
        String solicitanteEmail,
        EstadoSolicitud estado,
        PrioridadNivel prioridad,
        String justificacionPrioridad,
        UsuarioResumenResponse responsable,
        LocalDateTime fechaLimite,
        String observacion,
        String observacionCierre,
        String respuesta,
        TipoSolicitudCodigo tipoSugerenciaIa,
        PrioridadNivel prioridadSugerenciaIa,
        BigDecimal valorConfianzaIa) {
}
