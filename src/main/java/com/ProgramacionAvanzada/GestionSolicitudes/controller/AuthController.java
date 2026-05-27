package com.ProgramacionAvanzada.GestionSolicitudes.controller;

import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.LoginRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.AuthTokenResponse;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.UsuarioResumenResponse;
import com.ProgramacionAvanzada.GestionSolicitudes.security.ApplicationUserDetails;
import com.ProgramacionAvanzada.GestionSolicitudes.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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
}
