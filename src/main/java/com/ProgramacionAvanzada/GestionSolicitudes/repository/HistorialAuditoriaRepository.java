package com.ProgramacionAvanzada.GestionSolicitudes.repository;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.HistorialAuditoria;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistorialAuditoriaRepository extends JpaRepository<HistorialAuditoria, Long> {

    @EntityGraph(attributePaths = {"realizadoPor", "solicitud"})
    List<HistorialAuditoria> findBySolicitudPublicIdOrderByFechaHoraAsc(UUID solicitudPublicId);
}
