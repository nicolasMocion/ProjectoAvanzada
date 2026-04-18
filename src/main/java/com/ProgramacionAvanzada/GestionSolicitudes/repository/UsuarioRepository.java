package com.ProgramacionAvanzada.GestionSolicitudes.repository;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Usuario;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByPublicId(UUID publicId);

    Optional<Usuario> findByEmailIgnoreCase(String email);
}
