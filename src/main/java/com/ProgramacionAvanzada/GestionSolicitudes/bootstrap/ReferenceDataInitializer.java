package com.ProgramacionAvanzada.GestionSolicitudes.bootstrap;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.TipoSolicitud;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Usuario;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.RolUsuario;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.TipoSolicitudCodigo;
import com.ProgramacionAvanzada.GestionSolicitudes.repository.TipoSolicitudRepository;
import com.ProgramacionAvanzada.GestionSolicitudes.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ReferenceDataInitializer {

    private final TipoSolicitudRepository tipoSolicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public ApplicationRunner seedReferenceData() {
        return arguments -> {
            seed(TipoSolicitudCodigo.REGISTRO_ASIGNATURAS, "Registro de asignaturas",
                    "Solicitudes asociadas a inscripcion, cambios o ajustes de materias.");
            seed(TipoSolicitudCodigo.HOMOLOGACION, "Homologacion",
                    "Solicitudes para reconocer asignaturas o trayectorias previas.");
            seed(TipoSolicitudCodigo.CANCELACION, "Cancelacion",
                    "Solicitudes de cancelacion de asignaturas o retiros academicos.");
            seed(TipoSolicitudCodigo.SOLICITUD_CUPO, "Solicitud de cupo",
                    "Solicitudes para obtener cupo en cursos o grupos.");
            seed(TipoSolicitudCodigo.CONSULTA_ACADEMICA, "Consulta academica",
                    "Consultas generales sobre reglamento, procesos y tramites.");
            seed(TipoSolicitudCodigo.OTRO, "Otro",
                    "Categoria de respaldo para solicitudes no clasificadas.");

            seedUsuario(
                    "10000001",
                    "Estudiante Demo",
                    "estudiante.demo@example.com",
                    "CambioSeguro123!",
                    RolUsuario.ESTUDIANTE);
            seedUsuario(
                    "20000001",
                    "Operador Demo",
                    "operador.demo@example.com",
                    "CambioSeguro123!",
                    RolUsuario.OPERADOR);
            seedUsuario(
                    "30000001",
                    "Administrador Demo",
                    "admin.demo@example.com",
                    "CambioSeguro123!",
                    RolUsuario.ADMINISTRADOR);
        };
    }

    private void seed(TipoSolicitudCodigo codigo, String nombre, String descripcion) {
        tipoSolicitudRepository.findByCodigo(codigo).orElseGet(() -> {
            TipoSolicitud tipoSolicitud = new TipoSolicitud();
            tipoSolicitud.setCodigo(codigo);
            tipoSolicitud.setNombre(nombre);
            tipoSolicitud.setDescripcion(descripcion);
            return tipoSolicitudRepository.save(tipoSolicitud);
        });
    }

    private void seedUsuario(
            String identificacion,
            String nombre,
            String email,
            String rawPassword,
            RolUsuario rol) {
        usuarioRepository.findByEmailIgnoreCase(email).ifPresentOrElse(usuario -> {
            if (usuario.getPasswordHash() == null || usuario.getPasswordHash().isBlank()) {
                usuario.setPasswordHash(passwordEncoder.encode(rawPassword));
                usuarioRepository.save(usuario);
            }
        }, () -> {
            Usuario usuario = new Usuario();
            usuario.setIdentificacion(identificacion);
            usuario.setNombre(nombre);
            usuario.setEmail(email);
            usuario.setPasswordHash(passwordEncoder.encode(rawPassword));
            usuario.setRol(rol);
            usuario.setActivo(Boolean.TRUE);
            usuarioRepository.save(usuario);
        });
    }
}
