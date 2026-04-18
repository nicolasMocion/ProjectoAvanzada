package com.ProgramacionAvanzada.GestionSolicitudes.repository;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Solicitud;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long>, JpaSpecificationExecutor<Solicitud> {

    @EntityGraph(attributePaths = {"solicitante", "responsable", "tipoSolicitud"})
    Optional<Solicitud> findByPublicId(UUID publicId);
}
