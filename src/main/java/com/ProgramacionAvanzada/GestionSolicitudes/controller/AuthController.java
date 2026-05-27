package com.ProgramacionAvanzada.GestionSolicitudes.controller;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Usuario;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.RolUsuario;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.LoginRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.RegistroRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.AuthTokenResponse;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.UsuarioResumenResponse;
import com.ProgramacionAvanzada.GestionSolicitudes.exception.BusinessRuleException;
import com.ProgramacionAvanzada.GestionSolicitudes.repository.UsuarioRepository;
import com.ProgramacionAvanzada.GestionSolicitudes.security.ApplicationUserDetails;
import com.ProgramacionAvanzada.GestionSolicitudes.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public AuthTokenResponse login(@Valid @RequestBody LoginRequest request) {
        log.debug("Login attempt for: {}", request.email());
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password()));
        log.debug("Authentication successful, issuing token...");
        ApplicationUserDetails userDetails = (ApplicationUserDetails) authentication.getPrincipal();
        JwtService.IssuedToken issuedToken = jwtService.issueToken(userDetails);
        log.debug("Token issued, building response...");
        return new AuthTokenResponse(
                issuedToken.value(),
                "Bearer",
                issuedToken.expiresAt(),
                new UsuarioResumenResponse(
                        userDetails.getUsuario().getPublicId(),
                        userDetails.getUsuario().getNombre(),
                        userDetails.getUsuario().getRol()));
    }

    @PostMapping("/register")
    public AuthTokenResponse register(@Valid @RequestBody RegistroRequest request) {
        log.debug("Registration attempt for: {}", request.email());

        usuarioRepository.findByIdentificacion(request.identificacion().trim())
                .ifPresent(existing -> {
                    throw new BusinessRuleException("La identificacion ya se encuentra registrada.");
                });

        usuarioRepository.findByEmailIgnoreCase(request.email().trim())
                .ifPresent(existing -> {
                    throw new BusinessRuleException("El correo electronico ya se encuentra registrado.");
                });

        Usuario usuario = new Usuario();
        usuario.setIdentificacion(request.identificacion().trim());
        usuario.setNombre(request.nombre().trim());
        usuario.setEmail(request.email().trim().toLowerCase());
        usuario.setPasswordHash(passwordEncoder.encode(request.password().trim()));
        usuario.setRol(RolUsuario.ESTUDIANTE);
        usuario.setActivo(Boolean.TRUE);

        usuario = usuarioRepository.save(usuario);

        ApplicationUserDetails userDetails = new ApplicationUserDetails(usuario);
        JwtService.IssuedToken issuedToken = jwtService.issueToken(userDetails);

        return new AuthTokenResponse(
                issuedToken.value(),
                "Bearer",
                issuedToken.expiresAt(),
                new UsuarioResumenResponse(
                        usuario.getPublicId(),
                        usuario.getNombre(),
                        usuario.getRol()));
    }
}
