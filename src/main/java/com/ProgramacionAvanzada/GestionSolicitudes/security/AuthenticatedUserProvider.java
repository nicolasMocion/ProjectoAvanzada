package com.ProgramacionAvanzada.GestionSolicitudes.security;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Usuario;
import com.ProgramacionAvanzada.GestionSolicitudes.repository.UsuarioRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthenticatedUserProvider {

    private final UsuarioRepository usuarioRepository;

    public Usuario getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException("Se requiere un usuario autenticado.");
        }

        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            String subject = jwtAuthenticationToken.getToken().getSubject();
            return usuarioRepository.findByPublicId(UUID.fromString(subject))
                    .orElseThrow(() -> new AccessDeniedException("El usuario autenticado no existe."));
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof ApplicationUserDetails applicationUserDetails) {
            return applicationUserDetails.getUsuario();
        }
        if (principal instanceof UserDetails userDetails) {
            return usuarioRepository.findByEmailIgnoreCase(userDetails.getUsername())
                    .orElseThrow(() -> new AccessDeniedException("El usuario autenticado no existe."));
        }
        if (principal instanceof String username && !"anonymousUser".equalsIgnoreCase(username)) {
            return usuarioRepository.findByEmailIgnoreCase(username)
                    .orElseThrow(() -> new AccessDeniedException("El usuario autenticado no existe."));
        }

        throw new AccessDeniedException("No fue posible resolver el usuario autenticado.");
    }
}
