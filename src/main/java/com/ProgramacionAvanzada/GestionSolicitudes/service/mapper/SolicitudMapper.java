package com.ProgramacionAvanzada.GestionSolicitudes.service.mapper;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.HistorialAuditoria;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Prioridad;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Solicitud;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Usuario;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.HistorialAccionResponse;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.SolicitudResponse;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.UsuarioResumenResponse;
import org.springframework.stereotype.Component;

@Component
public class SolicitudMapper {

    public SolicitudResponse toResponse(Solicitud solicitud) {
        Prioridad prioridad = solicitud.getPrioridad();
        return new SolicitudResponse(
                solicitud.getPublicId(),
                solicitud.getTipoSolicitud().getCodigo(),
                solicitud.getDescripcion(),
                solicitud.getCanalOrigen(),
                solicitud.getFechaCreacion(),
                toUsuarioResumen(solicitud.getSolicitante()),
                solicitud.getEstado(),
                prioridad != null ? prioridad.getNivel() : null,
                prioridad != null ? prioridad.getJustificacion() : null,
                toUsuarioResumen(solicitud.getResponsable()),
                prioridad != null ? prioridad.getFechaLimite() : null,
                solicitud.getObservacion(),
                solicitud.getTipoSugerenciaIa(),
                solicitud.getPrioridadSugerenciaIa(),
                solicitud.getValorConfianzaIa());
    }

    public HistorialAccionResponse toHistorialResponse(HistorialAuditoria historialAuditoria) {
        return new HistorialAccionResponse(
                historialAuditoria.getPublicId(),
                historialAuditoria.getSolicitud().getPublicId(),
                historialAuditoria.getAccion(),
                toUsuarioResumen(historialAuditoria.getRealizadoPor()),
                historialAuditoria.getFechaHora(),
                historialAuditoria.getObservaciones());
    }

    private UsuarioResumenResponse toUsuarioResumen(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        return new UsuarioResumenResponse(usuario.getPublicId(), usuario.getNombre(), usuario.getRol());
    }
}
