package com.ProgramacionAvanzada.GestionSolicitudes.dto.response;

import java.util.Map;

public record ErrorResponse(
        int code,
        String message,
        Map<String, Object> details) {
}
