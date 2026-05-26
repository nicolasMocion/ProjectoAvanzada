package com.ProgramacionAvanzada.GestionSolicitudes.service;

import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.SugerenciaClasificacionRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.SugerenciaClasificacionResponse;

/**
 * Operaciones para IA
 * @author desuu03
 * @version 1.0
 */

public interface SugerenciaService {

    SugerenciaClasificacionResponse sugerirClasificacion(SugerenciaClasificacionRequest request);
}
