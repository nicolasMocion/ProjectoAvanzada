package com.ProgramacionAvanzada.GestionSolicitudes;

import static org.assertj.core.api.Assertions.assertThat;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Usuario;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.AccionHistorial;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.CanalOrigen;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.EstadoSolicitud;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.PrioridadNivel;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.RolUsuario;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.TipoSolicitudCodigo;
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
import com.ProgramacionAvanzada.GestionSolicitudes.repository.UsuarioRepository;
import com.ProgramacionAvanzada.GestionSolicitudes.security.ApplicationUserDetails;
import com.ProgramacionAvanzada.GestionSolicitudes.service.SolicitudFilter;
import com.ProgramacionAvanzada.GestionSolicitudes.service.SolicitudService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class SolicitudServiceIntegrationTest {

    @Autowired
    private SolicitudService solicitudService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Usuario solicitante;
    private Usuario operador;
    private Usuario administrador;

    @BeforeEach
    void setUp() {
        solicitante = createUsuario("EST", RolUsuario.ESTUDIANTE);
        operador = createUsuario("OPE", RolUsuario.OPERADOR);
        administrador = createUsuario("ADM", RolUsuario.ADMINISTRADOR);
        authenticateAs(solicitante);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldPersistFullLifecycleUsingOrm() {
        SolicitudResponse registrada = solicitudService.registrar(new CrearSolicitudRequest(
                TipoSolicitudCodigo.REGISTRO_ASIGNATURAS,
                "Necesito registrar una asignatura antes del cierre del proceso.",
                CanalOrigen.CORREO,
                solicitante.getPublicId(),
                LocalDateTime.now().plusDays(2)));

        authenticateAs(administrador);
        SolicitudResponse clasificada = solicitudService.clasificar(
                registrada.id(),
                new ClasificarSolicitudRequest(TipoSolicitudCodigo.REGISTRO_ASIGNATURAS, "Clasificacion inicial."));
        SolicitudResponse priorizada = solicitudService.priorizar(
                registrada.id(),
                new PriorizarSolicitudRequest(PrioridadNivel.ALTA, "El tramite vence esta semana."));
        SolicitudResponse asignada = solicitudService.asignar(
                registrada.id(),
                new AsignarSolicitudRequest(operador.getPublicId(), "Asignada al operador academico."));

        authenticateAs(operador);
        SolicitudResponse enAtencion = solicitudService.iniciarAtencion(
                registrada.id(),
                new IniciarAtencionRequest("Se inicia el analisis del caso."));
        SolicitudResponse atendida = solicitudService.resolver(
                registrada.id(),
                new ResolverSolicitudRequest("Se realizo el ajuste en el sistema."));
        SolicitudResponse cerrada = solicitudService.cerrar(
                registrada.id(),
                new CerrarSolicitudRequest("Cierre formal del tramite."));

        assertThat(registrada.estado()).isEqualTo(EstadoSolicitud.REGISTRADA);
        assertThat(clasificada.estado()).isEqualTo(EstadoSolicitud.CLASIFICADA);
        assertThat(priorizada.prioridad()).isEqualTo(PrioridadNivel.ALTA);
        assertThat(asignada.responsable().id()).isEqualTo(operador.getPublicId());
        assertThat(enAtencion.estado()).isEqualTo(EstadoSolicitud.EN_ATENCION);
        assertThat(atendida.estado()).isEqualTo(EstadoSolicitud.ATENDIDA);
        assertThat(cerrada.estado()).isEqualTo(EstadoSolicitud.CERRADA);

        List<HistorialAccionResponse> historial = solicitudService.obtenerHistorial(registrada.id());
        assertThat(historial).hasSize(7);
        assertThat(historial.stream().map(HistorialAccionResponse::accion).toList())
                .containsExactly(
                        AccionHistorial.REGISTRAR,
                        AccionHistorial.CLASIFICAR,
                        AccionHistorial.PRIORIZAR,
                        AccionHistorial.ASIGNAR,
                        AccionHistorial.INICIAR_ATENCION,
                        AccionHistorial.RESOLVER,
                        AccionHistorial.CERRAR);
        assertThat(historial.get(0).usuario().id()).isEqualTo(solicitante.getPublicId());
        assertThat(historial.get(1).usuario().id()).isEqualTo(administrador.getPublicId());
        assertThat(historial.get(3).usuario().id()).isEqualTo(administrador.getPublicId());
        assertThat(historial.get(4).usuario().id()).isEqualTo(operador.getPublicId());
    }

    @Test
    void shouldFilterRequestsByEstadoAndResponsable() {
        SolicitudResponse primera = solicitudService.registrar(new CrearSolicitudRequest(
                TipoSolicitudCodigo.CONSULTA_ACADEMICA,
                "Consulta general sobre homologacion.",
                CanalOrigen.SAC,
                solicitante.getPublicId(),
                null));
        SolicitudResponse segunda = solicitudService.registrar(new CrearSolicitudRequest(
                TipoSolicitudCodigo.SOLICITUD_CUPO,
                "Necesito cupo en una asignatura obligatoria.",
                CanalOrigen.CSU,
                solicitante.getPublicId(),
                LocalDateTime.now().plusDays(5)));

        authenticateAs(administrador);
        solicitudService.asignar(segunda.id(), new AsignarSolicitudRequest(operador.getPublicId(), "Asignada."));
        authenticateAs(solicitante);

        PagedResponse<SolicitudResponse> registradas = solicitudService.listar(
                new SolicitudFilter(EstadoSolicitud.REGISTRADA, null, null, null),
                PageRequest.of(0, 10));
        PagedResponse<SolicitudResponse> asignadasAResponsable = solicitudService.listar(
                new SolicitudFilter(null, null, null, operador.getPublicId()),
                PageRequest.of(0, 10));

        assertThat(registradas.total()).isEqualTo(2);
        assertThat(asignadasAResponsable.total()).isEqualTo(1);
        assertThat(asignadasAResponsable.items().getFirst().id()).isEqualTo(segunda.id());
        assertThat(asignadasAResponsable.items().getFirst().responsable().id()).isEqualTo(operador.getPublicId());
        assertThat(primera.id()).isNotNull();
    }

    private Usuario createUsuario(String prefix, RolUsuario rolUsuario) {
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        Usuario usuario = new Usuario();
        usuario.setIdentificacion(prefix + "-" + suffix);
        usuario.setNombre(prefix + " usuario");
        usuario.setEmail(prefix.toLowerCase() + "." + suffix + "@example.com");
        usuario.setRol(rolUsuario);
        usuario.setActivo(Boolean.TRUE);
        usuario.setPasswordHash("{noop}unused");

        return usuarioRepository.save(usuario);
    }

    private void authenticateAs(Usuario usuario) {
        ApplicationUserDetails userDetails = new ApplicationUserDetails(usuario);
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(
                        userDetails,
                        null,
                        userDetails.getAuthorities()));
    }
}
