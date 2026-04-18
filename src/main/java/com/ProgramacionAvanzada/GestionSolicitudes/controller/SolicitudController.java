package com.ProgramacionAvanzada.GestionSolicitudes.controller;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.EstadoSolicitud;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.PrioridadNivel;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.TipoSolicitudCodigo;
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
import com.ProgramacionAvanzada.GestionSolicitudes.service.SolicitudFilter;
import com.ProgramacionAvanzada.GestionSolicitudes.service.SolicitudService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    @PostMapping
    public ResponseEntity<SolicitudResponse> registrarSolicitud(@Valid @RequestBody CrearSolicitudRequest request) {
        SolicitudResponse response = solicitudService.registrar(request);
        return ResponseEntity
                .created(URI.create("/solicitudes/" + response.id()))
                .body(response);
    }

    @GetMapping
    public PagedResponse<SolicitudResponse> listarSolicitudes(
            @RequestParam(required = false) EstadoSolicitud estado,
            @RequestParam(required = false) TipoSolicitudCodigo tipo,
            @RequestParam(required = false) PrioridadNivel prioridad,
            @RequestParam(required = false) UUID responsableId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        SolicitudFilter filter = new SolicitudFilter(estado, tipo, prioridad, responsableId);
        return solicitudService.listar(filter, PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public SolicitudResponse obtenerSolicitud(@PathVariable UUID id) {
        return solicitudService.obtenerPorId(id);
    }

    @PatchMapping("/{id}")
    public SolicitudResponse actualizarSolicitud(
            @PathVariable UUID id,
            @Valid @RequestBody ActualizarSolicitudRequest request) {
        return solicitudService.actualizar(id, request);
    }

    @PatchMapping("/{id}/clasificar")
    public SolicitudResponse clasificarSolicitud(
            @PathVariable UUID id,
            @Valid @RequestBody ClasificarSolicitudRequest request) {
        return solicitudService.clasificar(id, request);
    }

    @PatchMapping("/{id}/priorizar")
    public SolicitudResponse priorizarSolicitud(
            @PathVariable UUID id,
            @Valid @RequestBody PriorizarSolicitudRequest request) {
        return solicitudService.priorizar(id, request);
    }

    @PatchMapping("/{id}/asignar")
    public SolicitudResponse asignarSolicitud(
            @PathVariable UUID id,
            @Valid @RequestBody AsignarSolicitudRequest request) {
        return solicitudService.asignar(id, request);
    }

    @PatchMapping("/{id}/iniciar-atencion")
    public SolicitudResponse iniciarAtencion(
            @PathVariable UUID id,
            @RequestBody(required = false) IniciarAtencionRequest request) {
        return solicitudService.iniciarAtencion(id, request);
    }

    @PatchMapping("/{id}/resolver")
    public SolicitudResponse resolverSolicitud(
            @PathVariable UUID id,
            @Valid @RequestBody ResolverSolicitudRequest request) {
        return solicitudService.resolver(id, request);
    }

    @PostMapping("/{id}/cerrar")
    public SolicitudResponse cerrarSolicitud(
            @PathVariable UUID id,
            @Valid @RequestBody CerrarSolicitudRequest request) {
        return solicitudService.cerrar(id, request);
    }

    @GetMapping("/{id}/historial")
    public List<HistorialAccionResponse> obtenerHistorial(@PathVariable UUID id) {
        return solicitudService.obtenerHistorial(id);
    }
}
