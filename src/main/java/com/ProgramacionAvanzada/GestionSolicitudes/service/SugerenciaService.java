package com.ProgramacionAvanzada.GestionSolicitudes.service;

import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.SugerenciaClasificacionRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.SugerenciaClasificacionResponse;

public interface SugerenciaService {

    SugerenciaClasificacionResponse sugerirClasificacion(SugerenciaClasificacionRequest request);
}
