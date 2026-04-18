package com.ProgramacionAvanzada.GestionSolicitudes.service.impl;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.HistorialAuditoria;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Solicitud;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.TipoSolicitud;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Usuario;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.AccionHistorial;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.EstadoSolicitud;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.RolUsuario;
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
import com.ProgramacionAvanzada.GestionSolicitudes.exception.BusinessRuleException;
import com.ProgramacionAvanzada.GestionSolicitudes.exception.ResourceNotFoundException;
import com.ProgramacionAvanzada.GestionSolicitudes.repository.HistorialAuditoriaRepository;
import com.ProgramacionAvanzada.GestionSolicitudes.repository.SolicitudRepository;
import com.ProgramacionAvanzada.GestionSolicitudes.repository.TipoSolicitudRepository;
import com.ProgramacionAvanzada.GestionSolicitudes.repository.UsuarioRepository;
import com.ProgramacionAvanzada.GestionSolicitudes.repository.specification.SolicitudSpecifications;
import com.ProgramacionAvanzada.GestionSolicitudes.security.AuthenticatedUserProvider;
import com.ProgramacionAvanzada.GestionSolicitudes.service.SolicitudFilter;
import com.ProgramacionAvanzada.GestionSolicitudes.service.SolicitudService;
import com.ProgramacionAvanzada.GestionSolicitudes.service.mapper.SolicitudMapper;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
@RequiredArgsConstructor
public class SolicitudServiceImpl implements SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final TipoSolicitudRepository tipoSolicitudRepository;
    private final HistorialAuditoriaRepository historialAuditoriaRepository;
    private final SolicitudMapper solicitudMapper;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    @Override
    public SolicitudResponse registrar(CrearSolicitudRequest request) {
        Usuario actor = authenticatedUserProvider.getCurrentUser();
        Usuario solicitante = findUsuario(request.solicitanteId(), "No existe el solicitante indicado.");
        ensureCanRegisterFor(actor, solicitante);
        TipoSolicitud tipoSolicitud = findTipoSolicitud(request.tipo());

        Solicitud solicitud = new Solicitud();
        solicitud.setDescripcion(request.descripcion().trim());
        solicitud.setCanalOrigen(request.canalOrigen());
        solicitud.setSolicitante(solicitante);
        solicitud.setTipoSolicitud(tipoSolicitud);
        solicitud.registrar();
        solicitud.getPrioridad().setFechaLimite(request.fechaLimite());

        registrarEvento(solicitud, AccionHistorial.REGISTRAR, actor,
                "Solicitud registrada desde el canal " + request.canalOrigen().value() + ".");

        return solicitudMapper.toResponse(solicitudRepository.save(solicitud));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<SolicitudResponse> listar(SolicitudFilter filter, Pageable pageable) {
        Usuario actor = authenticatedUserProvider.getCurrentUser();
        Specification<Solicitud> specification = SolicitudSpecifications.byFilter(filter);
        if (!isPrivileged(actor)) {
            specification = specification.and(SolicitudSpecifications.visibleTo(actor.getPublicId()));
        }

        Page<Solicitud> page = solicitudRepository.findAll(specification, pageable);
        return new PagedResponse<>(
                page.getTotalElements(),
                page.getContent().stream().map(solicitudMapper::toResponse).toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SolicitudResponse obtenerPorId(UUID solicitudId) {
        Solicitud solicitud = findSolicitud(solicitudId);
        ensureCanView(solicitud, authenticatedUserProvider.getCurrentUser());
        return solicitudMapper.toResponse(solicitud);
    }

    @Override
    public SolicitudResponse actualizar(UUID solicitudId, ActualizarSolicitudRequest request) {
        Solicitud solicitud = findSolicitud(solicitudId);
        Usuario actor = authenticatedUserProvider.getCurrentUser();
        ensureCanUpdate(solicitud, actor);
        ensureEditable(solicitud);

        if (request.descripcion() != null) {
            if (!StringUtils.hasText(request.descripcion())) {
                throw new BusinessRuleException("La descripcion no puede quedar vacia.");
            }
            solicitud.setDescripcion(request.descripcion().trim());
        }
        if (request.fechaLimite() != null) {
            solicitud.getPrioridad().setFechaLimite(request.fechaLimite());
        }

        registrarEvento(solicitud, AccionHistorial.ACTUALIZAR, actor,
                "Solicitud actualizada.");

        return solicitudMapper.toResponse(solicitudRepository.save(solicitud));
    }

    @Override
    public SolicitudResponse clasificar(UUID solicitudId, ClasificarSolicitudRequest request) {
        Solicitud solicitud = findSolicitud(solicitudId);
        Usuario actor = authenticatedUserProvider.getCurrentUser();
        ensureOperatorOrAdmin(actor);
        if (!(EstadoSolicitud.REGISTRADA.equals(solicitud.getEstado())
                || EstadoSolicitud.CLASIFICADA.equals(solicitud.getEstado()))) {
            throw new BusinessRuleException("Solo se pueden clasificar solicitudes registradas o ya clasificadas.");
        }

        solicitud.setTipoSolicitud(findTipoSolicitud(request.tipo()));
        if (StringUtils.hasText(request.observacion())) {
            solicitud.setObservacion(request.observacion().trim());
        }
        if (EstadoSolicitud.REGISTRADA.equals(solicitud.getEstado())) {
            solicitud.cambiarEstado(EstadoSolicitud.CLASIFICADA);
        }

        registrarEvento(solicitud, AccionHistorial.CLASIFICAR, actor,
                StringUtils.hasText(request.observacion())
                        ? request.observacion().trim()
                        : "Solicitud clasificada.");

        return solicitudMapper.toResponse(solicitudRepository.save(solicitud));
    }

    @Override
    public SolicitudResponse priorizar(UUID solicitudId, PriorizarSolicitudRequest request) {
        Solicitud solicitud = findSolicitud(solicitudId);
        Usuario actor = authenticatedUserProvider.getCurrentUser();
        ensureOperatorOrAdmin(actor);
        ensureEditable(solicitud);

        solicitud.getPrioridad().setNivel(request.prioridad());
        solicitud.getPrioridad().setJustificacion(request.justificacion().trim());

        registrarEvento(solicitud, AccionHistorial.PRIORIZAR, actor,
                request.justificacion().trim());

        return solicitudMapper.toResponse(solicitudRepository.save(solicitud));
    }

    @Override
    public SolicitudResponse asignar(UUID solicitudId, AsignarSolicitudRequest request) {
        Solicitud solicitud = findSolicitud(solicitudId);
        Usuario actor = authenticatedUserProvider.getCurrentUser();
        ensureOperatorOrAdmin(actor);
        ensureEditable(solicitud);

        Usuario responsable = findUsuario(request.responsableId(), "No existe el responsable indicado.");
        solicitud.asignarResponsable(responsable);
        if (StringUtils.hasText(request.observacion())) {
            solicitud.setObservacion(request.observacion().trim());
        }

        registrarEvento(solicitud, AccionHistorial.ASIGNAR, actor,
                StringUtils.hasText(request.observacion())
                        ? request.observacion().trim()
                        : "Solicitud asignada al responsable " + responsable.getNombre() + ".");

        return solicitudMapper.toResponse(solicitudRepository.save(solicitud));
    }

    @Override
    public SolicitudResponse iniciarAtencion(UUID solicitudId, IniciarAtencionRequest request) {
        Solicitud solicitud = findSolicitud(solicitudId);
        Usuario actor = authenticatedUserProvider.getCurrentUser();
        ensureCanActAsResponsible(solicitud, actor);
        ensureResponsibleAssigned(solicitud);
        ensureState(solicitud, EstadoSolicitud.CLASIFICADA,
                "Solo las solicitudes clasificadas pueden pasar a en_atencion.");

        solicitud.cambiarEstado(EstadoSolicitud.EN_ATENCION);
        if (request != null && StringUtils.hasText(request.observacion())) {
            solicitud.setObservacion(request.observacion().trim());
        }

        registrarEvento(solicitud, AccionHistorial.INICIAR_ATENCION, actor,
                request != null && StringUtils.hasText(request.observacion())
                        ? request.observacion().trim()
                        : "Atencion iniciada.");

        return solicitudMapper.toResponse(solicitudRepository.save(solicitud));
    }

    @Override
    public SolicitudResponse resolver(UUID solicitudId, ResolverSolicitudRequest request) {
        Solicitud solicitud = findSolicitud(solicitudId);
        Usuario actor = authenticatedUserProvider.getCurrentUser();
        ensureCanActAsResponsible(solicitud, actor);
        ensureResponsibleAssigned(solicitud);
        ensureState(solicitud, EstadoSolicitud.EN_ATENCION,
                "Solo las solicitudes en atencion pueden resolverse.");

        solicitud.setRespuesta(request.respuesta().trim());
        solicitud.cambiarEstado(EstadoSolicitud.ATENDIDA);

        registrarEvento(solicitud, AccionHistorial.RESOLVER, actor,
                request.respuesta().trim());

        return solicitudMapper.toResponse(solicitudRepository.save(solicitud));
    }

    @Override
    public SolicitudResponse cerrar(UUID solicitudId, CerrarSolicitudRequest request) {
        Solicitud solicitud = findSolicitud(solicitudId);
        Usuario actor = authenticatedUserProvider.getCurrentUser();
        ensureCanActAsResponsible(solicitud, actor);
        ensureResponsibleAssigned(solicitud);
        ensureState(solicitud, EstadoSolicitud.ATENDIDA,
                "Solo las solicitudes atendidas pueden cerrarse.");

        solicitud.setObservacionCierre(request.observacionCierre().trim());
        solicitud.cambiarEstado(EstadoSolicitud.CERRADA);

        registrarEvento(solicitud, AccionHistorial.CERRAR, actor,
                request.observacionCierre().trim());

        return solicitudMapper.toResponse(solicitudRepository.save(solicitud));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistorialAccionResponse> obtenerHistorial(UUID solicitudId) {
        Solicitud solicitud = findSolicitud(solicitudId);
        ensureCanView(solicitud, authenticatedUserProvider.getCurrentUser());
        return historialAuditoriaRepository.findBySolicitudPublicIdOrderByFechaHoraAsc(solicitudId)
                .stream()
                .map(solicitudMapper::toHistorialResponse)
                .toList();
    }

    private Solicitud findSolicitud(UUID solicitudId) {
        return solicitudRepository.findByPublicId(solicitudId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la solicitud indicada."));
    }

    private Usuario findUsuario(UUID usuarioId, String message) {
        return usuarioRepository.findByPublicId(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException(message));
    }

    private TipoSolicitud findTipoSolicitud(com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.TipoSolicitudCodigo codigo) {
        return tipoSolicitudRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe el catalogo para el tipo de solicitud " + codigo.value() + "."));
    }

    private void registrarEvento(Solicitud solicitud, AccionHistorial accion, Usuario actor, String observacion) {
        HistorialAuditoria evento = new HistorialAuditoria();
        evento.setAccion(accion);
        evento.setRealizadoPor(actor);
        evento.setObservaciones(observacion);
        solicitud.agregarEvento(evento);
    }

    private void ensureEditable(Solicitud solicitud) {
        if (solicitud.estaCerrada()) {
            throw new BusinessRuleException("La solicitud ya esta cerrada y no puede modificarse.");
        }
    }

    private void ensureResponsibleAssigned(Solicitud solicitud) {
        if (solicitud.getResponsable() == null) {
            throw new BusinessRuleException("La solicitud debe tener un responsable asignado.");
        }
    }

    private void ensureState(Solicitud solicitud, EstadoSolicitud expected, String message) {
        if (!expected.equals(solicitud.getEstado())) {
            throw new BusinessRuleException(message);
        }
    }

    private void ensureCanRegisterFor(Usuario actor, Usuario solicitante) {
        if (!isPrivileged(actor) && !actor.getPublicId().equals(solicitante.getPublicId())) {
            throw new AccessDeniedException("Solo operadores o administradores pueden registrar solicitudes para terceros.");
        }
    }

    private void ensureCanView(Solicitud solicitud, Usuario actor) {
        if (isPrivileged(actor)
                || actor.getPublicId().equals(solicitud.getSolicitante().getPublicId())
                || (solicitud.getResponsable() != null
                && actor.getPublicId().equals(solicitud.getResponsable().getPublicId()))) {
            return;
        }
        throw new AccessDeniedException("No tiene permisos para consultar esta solicitud.");
    }

    private void ensureCanUpdate(Solicitud solicitud, Usuario actor) {
        if (isPrivileged(actor) || actor.getPublicId().equals(solicitud.getSolicitante().getPublicId())) {
            return;
        }
        throw new AccessDeniedException("Solo el solicitante o un usuario operativo puede actualizar la solicitud.");
    }

    private void ensureOperatorOrAdmin(Usuario actor) {
        if (isPrivileged(actor)) {
            return;
        }
        throw new AccessDeniedException("Esta operacion requiere rol operador o administrador.");
    }

    private void ensureCanActAsResponsible(Solicitud solicitud, Usuario actor) {
        if (isPrivileged(actor)) {
            return;
        }
        if (solicitud.getResponsable() != null
                && actor.getPublicId().equals(solicitud.getResponsable().getPublicId())) {
            return;
        }
        throw new AccessDeniedException("Solo el responsable asignado o un usuario operativo puede ejecutar esta operacion.");
    }

    private boolean isPrivileged(Usuario actor) {
        return RolUsuario.OPERADOR.equals(actor.getRol()) || RolUsuario.ADMINISTRADOR.equals(actor.getRol());
    }
}
