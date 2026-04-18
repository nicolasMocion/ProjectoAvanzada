package com.ProgramacionAvanzada.GestionSolicitudes.repository.specification;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity.Solicitud;
import com.ProgramacionAvanzada.GestionSolicitudes.service.SolicitudFilter;
import jakarta.persistence.criteria.JoinType;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class SolicitudSpecifications {

    private SolicitudSpecifications() {
    }

    public static Specification<Solicitud> byFilter(SolicitudFilter filter) {
        return (root, query, criteriaBuilder) -> {
            if (!Long.class.equals(query.getResultType()) && !long.class.equals(query.getResultType())) {
                root.fetch("solicitante", JoinType.LEFT);
                root.fetch("responsable", JoinType.LEFT);
                root.fetch("tipoSolicitud", JoinType.LEFT);
                query.distinct(true);
            }

            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (filter.estado() != null) {
                predicates.add(criteriaBuilder.equal(root.get("estado"), filter.estado()));
            }
            if (filter.tipo() != null) {
                predicates.add(criteriaBuilder.equal(root.get("tipoSolicitud").get("codigo"), filter.tipo()));
            }
            if (filter.prioridad() != null) {
                predicates.add(criteriaBuilder.equal(root.get("prioridad").get("nivel"), filter.prioridad()));
            }
            if (filter.responsableId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("responsable").get("publicId"), filter.responsableId()));
            }

            return criteriaBuilder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    public static Specification<Solicitud> visibleTo(UUID usuarioPublicId) {
        return (root, query, criteriaBuilder) -> {
            var solicitante = root.join("solicitante", JoinType.LEFT);
            var responsable = root.join("responsable", JoinType.LEFT);
            return criteriaBuilder.or(
                    criteriaBuilder.equal(solicitante.get("publicId"), usuarioPublicId),
                    criteriaBuilder.equal(responsable.get("publicId"), usuarioPublicId));
        };
    }
}
