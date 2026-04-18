package com.ProgramacionAvanzada.GestionSolicitudes.security;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Usuario;
import java.util.Collection;
import java.util.List;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class ApplicationUserDetails implements UserDetails {

    private final Usuario usuario;

    public ApplicationUserDetails(Usuario usuario) {
        this.usuario = usuario;
    }

    public String publicId() {
        return usuario.getPublicId().toString();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()));
    }

    @Override
    public String getPassword() {
        return usuario.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return usuario.getEmail();
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(usuario.getActivo());
    }
}
