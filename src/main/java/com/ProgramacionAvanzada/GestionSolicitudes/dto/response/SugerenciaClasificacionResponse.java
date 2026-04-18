package com.ProgramacionAvanzada.GestionSolicitudes.dto.response;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.PrioridadNivel;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.TipoSolicitudCodigo;
import java.math.BigDecimal;

public record SugerenciaClasificacionResponse(
        TipoSolicitudCodigo suggestedType,
        PrioridadNivel suggestedPriority,
        BigDecimal confidence) {
}
