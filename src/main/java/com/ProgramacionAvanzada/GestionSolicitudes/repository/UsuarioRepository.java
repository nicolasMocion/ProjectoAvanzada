package com.ProgramacionAvanzada.GestionSolicitudes.repository;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Usuario;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByPublicId(UUID publicId);
    Optional<Usuario> findByIdentificacion(String identificacion);
    Optional<Usuario> findByEmailIgnoreCase(String email);
    List<Usuario> findByRolAndActivoTrue(RolUsuario rol);
}
