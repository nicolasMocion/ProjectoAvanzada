package com.ProgramacionAvanzada.GestionSolicitudes.dto.response;

import java.util.List;

public record PagedResponse<T>(
        long total,
        List<T> items) {
}
