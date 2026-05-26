package com.ProgramacionAvanzada.GestionSolicitudes.controller;

import com.ProgramacionAvanzada.GestionSolicitudes.dto.request.SugerenciaClasificacionRequest;
import com.ProgramacionAvanzada.GestionSolicitudes.dto.response.SugerenciaClasificacionResponse;
import com.ProgramacionAvanzada.GestionSolicitudes.service.SugerenciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Gestiona sugerencias de clasificación de la IA (en proceso)
 * @author desuu03
 * @version 1.0
 */

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/sugerencias")
public class SugerenciaController {

    private final SugerenciaService sugerenciaService;

    @PostMapping("/clasificar")
    public SugerenciaClasificacionResponse sugerirClasificacion(
            @Valid @RequestBody SugerenciaClasificacionRequest request) {
        return sugerenciaService.sugerirClasificacion(request);
    }
}
