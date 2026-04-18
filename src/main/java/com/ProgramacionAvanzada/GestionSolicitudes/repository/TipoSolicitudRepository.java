package com.ProgramacionAvanzada.GestionSolicitudes.repository;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.TipoSolicitud;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.TipoSolicitudCodigo;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoSolicitudRepository extends JpaRepository<TipoSolicitud, Long> {

    Optional<TipoSolicitud> findByCodigo(TipoSolicitudCodigo codigo);
}
