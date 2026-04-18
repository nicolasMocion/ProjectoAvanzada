package com.ProgramacionAvanzada.GestionSolicitudes.security;

import com.ProgramacionAvanzada.GestionSolicitudes.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ApplicationUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        return usuarioRepository.findByEmailIgnoreCase(username)
                .map(ApplicationUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("No existe un usuario con ese correo."));
    }
}
