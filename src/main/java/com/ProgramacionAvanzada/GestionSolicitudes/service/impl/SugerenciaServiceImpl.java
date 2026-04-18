package com.ProgramacionAvanzada.GestionSolicitudes.service.impl;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.PrioridadNivel;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.TipoSolicitudCodigo;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.SugerenciaClasificacionRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.SugerenciaClasificacionResponse;
import com.ProgramacionAvanzada.GestionSolicitudes.service.SugerenciaService;
import java.math.BigDecimal;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class SugerenciaServiceImpl implements SugerenciaService {

    @Override
    public SugerenciaClasificacionResponse sugerirClasificacion(SugerenciaClasificacionRequest request) {
        String descripcion = request.descripcion().toLowerCase(Locale.ROOT);

        TipoSolicitudCodigo tipo = suggestType(descripcion);
        PrioridadNivel prioridad = suggestPriority(descripcion);
        BigDecimal confidence = buildConfidence(tipo, prioridad, descripcion);

        return new SugerenciaClasificacionResponse(tipo, prioridad, confidence);
    }

    private TipoSolicitudCodigo suggestType(String descripcion) {
        if (descripcion.contains("homolog")) {
            return TipoSolicitudCodigo.HOMOLOGACION;
        }
        if (descripcion.contains("cancel")) {
            return TipoSolicitudCodigo.CANCELACION;
        }
        if (descripcion.contains("cupo")) {
            return TipoSolicitudCodigo.SOLICITUD_CUPO;
        }
        if (descripcion.contains("registro") || descripcion.contains("asignatura") || descripcion.contains("matricula")) {
            return TipoSolicitudCodigo.REGISTRO_ASIGNATURAS;
        }
        if (descripcion.contains("consulta") || descripcion.contains("pregunta")) {
            return TipoSolicitudCodigo.CONSULTA_ACADEMICA;
        }
        return TipoSolicitudCodigo.OTRO;
    }

    private PrioridadNivel suggestPriority(String descripcion) {
        if (descripcion.contains("urgente") || descripcion.contains("hoy") || descripcion.contains("inmediato")) {
            return PrioridadNivel.URGENTE;
        }
        if (descripcion.contains("limite") || descripcion.contains("vence") || descripcion.contains("pronto")) {
            return PrioridadNivel.ALTA;
        }
        if (descripcion.contains("semana") || descripcion.contains("revision")) {
            return PrioridadNivel.MEDIA;
        }
        return PrioridadNivel.BAJA;
    }

    private BigDecimal buildConfidence(
            TipoSolicitudCodigo tipo,
            PrioridadNivel prioridad,
            String descripcion) {
        double score = 0.45;

        if (!TipoSolicitudCodigo.OTRO.equals(tipo)) {
            score += 0.25;
        }
        if (!PrioridadNivel.BAJA.equals(prioridad)) {
            score += 0.15;
        }
        if (descripcion.length() > 40) {
            score += 0.10;
        }

        return BigDecimal.valueOf(Math.min(score, 0.95)).setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
