package com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.PrioridadNivel;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Embeddable
public class Prioridad {

    @Enumerated(EnumType.STRING)
    @Column(name = "prioridad_nivel", length = 20)
    private PrioridadNivel nivel;

    @Column(name = "prioridad_justificacion", length = 500)
    private String justificacion;

    @Column(name = "fecha_limite")
    private LocalDateTime fechaLimite;
}
