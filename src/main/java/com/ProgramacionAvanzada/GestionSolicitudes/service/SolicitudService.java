package com.ProgramacionAvanzada.GestionSolicitudes.service;

import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.ActualizarSolicitudRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.AsignarSolicitudRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.CerrarSolicitudRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.ClasificarSolicitudRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.CrearSolicitudRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.IniciarAtencionRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.PriorizarSolicitudRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.ResolverSolicitudRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.HistorialAccionResponse;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.PagedResponse;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.SolicitudResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface SolicitudService {

    SolicitudResponse registrar(CrearSolicitudRequest request);

    PagedResponse<SolicitudResponse> listar(SolicitudFilter filter, Pageable pageable);

    SolicitudResponse obtenerPorId(UUID solicitudId);

    SolicitudResponse actualizar(UUID solicitudId, ActualizarSolicitudRequest request);

    SolicitudResponse clasificar(UUID solicitudId, ClasificarSolicitudRequest request);

    SolicitudResponse priorizar(UUID solicitudId, PriorizarSolicitudRequest request);

    SolicitudResponse asignar(UUID solicitudId, AsignarSolicitudRequest request);

    SolicitudResponse iniciarAtencion(UUID solicitudId, IniciarAtencionRequest request);

    SolicitudResponse resolver(UUID solicitudId, ResolverSolicitudRequest request);

    SolicitudResponse cerrar(UUID solicitudId, CerrarSolicitudRequest request);

    List<HistorialAccionResponse> obtenerHistorial(UUID solicitudId);
}
