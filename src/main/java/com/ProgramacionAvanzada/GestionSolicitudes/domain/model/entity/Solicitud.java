package com.ProgramacionAvanzada.GestionSolicitudes.domain.model.entity;

import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.CanalOrigen;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.EstadoSolicitud;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.PrioridadNivel;
import com.ProgramacionAvanzada.GestionSolicitudes.domain.model.enumeration.TipoSolicitudCodigo;
import com.ProgramacionAvanzada.GestionSolicitudes.exception.BusinessRuleException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "solicitudes")
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId;

    @Column(nullable = false, length = 2000)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal_origen", nullable = false, length = 30)
    private CanalOrigen canalOrigen;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoSolicitud estado;

    @Column(length = 500)
    private String observacion;

    @Column(name = "observacion_cierre", length = 1000)
    private String observacionCierre;

    @Column(length = 2000)
    private String respuesta;

    @Embedded
    private Prioridad prioridad = new Prioridad();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitante_id", nullable = false)
    private Usuario solicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id")
    private Usuario responsable;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tipo_solicitud_id", nullable = false)
    private TipoSolicitud tipoSolicitud;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_sugerencia_ia", length = 40)
    private TipoSolicitudCodigo tipoSugerenciaIa;

    @Enumerated(EnumType.STRING)
    @Column(name = "prioridad_sugerencia_ia", length = 20)
    private PrioridadNivel prioridadSugerenciaIa;

    @Column(name = "valor_confianza_ia", precision = 4, scale = 3)
    private BigDecimal valorConfianzaIa;

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HistorialAuditoria> historial = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (estado == null) {
            estado = EstadoSolicitud.REGISTRADA;
        }
    }

    public void registrar() {
        fechaCreacion = LocalDateTime.now();
        estado = EstadoSolicitud.REGISTRADA;
    }

    public void asignarResponsable(Usuario usuario) {
        if (usuario == null || !Boolean.TRUE.equals(usuario.getActivo())) {
            throw new BusinessRuleException("No se puede asignar un responsable inactivo.");
        }
        responsable = usuario;
    }

    public void cambiarEstado(EstadoSolicitud nuevoEstado) {
        if (nuevoEstado == null) {
            throw new BusinessRuleException("El estado destino es obligatorio.");
        }
        if (!estado.canTransitionTo(nuevoEstado)) {
            throw new BusinessRuleException("La transicion de estado no es valida.");
        }
        estado = nuevoEstado;
    }

    public boolean estaCerrada() {
        return EstadoSolicitud.CERRADA.equals(estado);
    }

    public void agregarEvento(HistorialAuditoria evento) {
        historial.add(evento);
        evento.setSolicitud(this);
    }
}
