package com.ProgramacionAvanzada.GestionSolicitudes.controller;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Usuario;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.RolUsuario;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.ActualizarUsuarioRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.CrearUsuarioRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.UsuarioResumenResponse;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.UsuarioResponse;
import com.ProgramacionAvanzada.GestionSolicitudes.exception.BusinessRuleException;
import com.ProgramacionAvanzada.GestionSolicitudes.exception.ResourceNotFoundException;
import com.ProgramacionAvanzada.GestionSolicitudes.repository.UsuarioRepository;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/operadores-activos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    public List<UsuarioResumenResponse> listarOperadoresActivos() {
        return usuarioRepository.findByRolAndActivoTrue(RolUsuario.OPERADOR)
                .stream()
                .map(u -> new UsuarioResumenResponse(u.getPublicId(), u.getNombre(), u.getRol()))
                .toList();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .sorted(java.util.Comparator.comparing(UsuarioResponse::nombre, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public UsuarioResponse obtener(@PathVariable UUID id) {
        return toResponse(findUsuario(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody CrearUsuarioRequest request) {
        validateUnique(null, request.identificacion(), request.email());

        Usuario usuario = new Usuario();
        usuario.setIdentificacion(request.identificacion().trim());
        usuario.setNombre(request.nombre().trim());
        usuario.setEmail(request.email().trim().toLowerCase());
        usuario.setPasswordHash(passwordEncoder.encode(request.password().trim()));
        usuario.setRol(request.rol());
        usuario.setActivo(Boolean.TRUE);

        Usuario saved = usuarioRepository.save(usuario);
        return ResponseEntity
                .created(URI.create("/usuarios/" + saved.getPublicId()))
                .body(toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public UsuarioResponse actualizar(@PathVariable UUID id, @Valid @RequestBody ActualizarUsuarioRequest request) {
        Usuario usuario = findUsuario(id);

        String identificacion = request.identificacion() != null ? request.identificacion().trim() : usuario.getIdentificacion();
        String email = request.email() != null ? request.email().trim().toLowerCase() : usuario.getEmail();
        validateUnique(usuario.getPublicId(), identificacion, email);

        if (StringUtils.hasText(request.identificacion())) {
            usuario.setIdentificacion(request.identificacion().trim());
        }
        if (StringUtils.hasText(request.nombre())) {
            usuario.setNombre(request.nombre().trim());
        }
        if (StringUtils.hasText(request.email())) {
            usuario.setEmail(request.email().trim().toLowerCase());
        }
        if (StringUtils.hasText(request.password())) {
            usuario.setPasswordHash(passwordEncoder.encode(request.password().trim()));
        }
        if (request.rol() != null) {
            usuario.setRol(request.rol());
        }
        if (request.activo() != null) {
            usuario.setActivo(request.activo());
        }

        return toResponse(usuarioRepository.save(usuario));
    }

    @PatchMapping("/{id}/toggle-activo")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public UsuarioResponse toggleActivo(@PathVariable UUID id) {
        Usuario usuario = findUsuario(id);
        usuario.setActivo(!Boolean.TRUE.equals(usuario.getActivo()));
        return toResponse(usuarioRepository.save(usuario));
    }

    private Usuario findUsuario(UUID id) {
        return usuarioRepository.findByPublicId(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el usuario indicado."));
    }

    private void validateUnique(UUID currentUserId, String identificacion, String email) {
        usuarioRepository.findByIdentificacion(identificacion)
                .filter(existing -> currentUserId == null || !existing.getPublicId().equals(currentUserId))
                .ifPresent(existing -> {
                    throw new BusinessRuleException("La identificacion ya se encuentra registrada.");
                });

        usuarioRepository.findByEmailIgnoreCase(email)
                .filter(existing -> currentUserId == null || !existing.getPublicId().equals(currentUserId))
                .ifPresent(existing -> {
                    throw new BusinessRuleException("El correo electronico ya se encuentra registrado.");
                });
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getPublicId(),
                usuario.getIdentificacion(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol(),
                usuario.getActivo());
    }
}
