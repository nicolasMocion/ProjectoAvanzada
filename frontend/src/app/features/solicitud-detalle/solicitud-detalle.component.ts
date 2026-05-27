import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { HistorialAccion, PrioridadNivel, Solicitud } from '../../models/solicitud.model';
import { RolUsuario } from '../../models/auth.model';

@Component({
  selector: 'app-solicitud-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="cerrarModal()">
      <div class="modal-content detalle-modal" (click)="$event.stopPropagation()">
        <div class="detalle-header">
          <h3>Detalle de Solicitud</h3>
          <button class="btn-close" (click)="cerrarModal()">&times;</button>
        </div>

        <div *ngIf="loading" class="spinner"></div>
        <div *ngIf="!loading && solicitud" class="detalle-body">
          <div class="detalle-grid">
            <div class="detalle-field">
              <label>ID</label>
              <code>{{ solicitud.id }}</code>
            </div>
            <div class="detalle-field">
              <label>Estado</label>
              <span class="badge badge-{{ solicitud.estado | lowercase }}">{{ formatEstado(solicitud.estado) }}</span>
            </div>
            <div class="detalle-field">
              <label>Tipo</label>
              <span>{{ formatTipo(solicitud.tipo) }}</span>
            </div>
            <div class="detalle-field">
              <label>Prioridad</label>
              <span *ngIf="solicitud.prioridad?.nivel" class="badge badge-{{ solicitud.prioridad!.nivel | lowercase }}">
                {{ solicitud.prioridad!.nivel }}
              </span>
              <span *ngIf="!solicitud.prioridad?.nivel" class="text-muted">Sin definir</span>
            </div>
            <div class="detalle-field">
              <label>Solicitante</label>
              <span>{{ solicitud.solicitante.nombre }}</span>
            </div>
            <div class="detalle-field">
              <label>Responsable</label>
              <span>{{ solicitud.responsable?.nombre || 'Sin asignar' }}</span>
            </div>
            <div class="detalle-field">
              <label>Canal</label>
              <span>{{ solicitud.canalOrigen }}</span>
            </div>
            <div class="detalle-field">
              <label>Fecha Creacion</label>
              <span>{{ solicitud.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="detalle-field" *ngIf="solicitud.fechaLimite">
              <label>Fecha Limite</label>
              <span>{{ solicitud.fechaLimite | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>

          <div class="detalle-section">
            <label>Descripcion</label>
            <p>{{ solicitud.descripcion }}</p>
          </div>

          <div class="detalle-section" *ngIf="solicitud.observacion">
            <label>Observacion</label>
            <p>{{ solicitud.observacion }}</p>
          </div>

          <div class="detalle-section" *ngIf="solicitud.respuesta">
            <label>Respuesta</label>
            <p>{{ solicitud.respuesta }}</p>
          </div>

          <div class="detalle-section" *ngIf="solicitud.observacionCierre">
            <label>Observacion de Cierre</label>
            <p>{{ solicitud.observacionCierre }}</p>
          </div>

          <div *ngIf="solicitud.estado !== 'CERRADA'" class="acciones-section">
            <h4>Acciones</h4>
            <div class="acciones-grid">
              <button *ngIf="modoOperador && solicitud.estado === 'REGISTRADA'" class="btn btn-primary btn-sm" (click)="mostrarClasificar = true">
                Clasificar
              </button>
              <button *ngIf="modoOperador && solicitud.estado === 'CLASIFICADA'" class="btn btn-primary btn-sm" (click)="mostrarPriorizar = true">
                Priorizar
              </button>
              <button *ngIf="modoOperador && !solicitud.responsable" class="btn btn-success btn-sm" (click)="asignarme()">
                Asignarme
              </button>
              <button *ngIf="modoOperador && solicitud.estado === 'CLASIFICADA' && solicitud.responsable" class="btn btn-primary btn-sm" (click)="iniciarAtencion()">
                Iniciar Atencion
              </button>
              <button *ngIf="modoOperador && solicitud.estado === 'CLASIFICADA'" class="btn btn-primary btn-sm" (click)="mostrarAsignar = true">
                Asignar
              </button>
              <button *ngIf="modoOperador && solicitud.estado === 'EN_ATENCION'" class="btn btn-primary btn-sm" (click)="mostrarResolver = true">
                Resolver
              </button>
              <button *ngIf="modoOperador && solicitud.estado === 'ATENDIDA'" class="btn btn-primary btn-sm" (click)="mostrarCerrar = true">
                Cerrar
              </button>
              <button *ngIf="puedeEliminar" class="btn btn-danger btn-sm" (click)="mostrarEliminar = true">
                Eliminar
              </button>
            </div>
          </div>

          <div class="historial-section">
            <h4>Historial de Auditoria</h4>
            <div *ngIf="cargandoHistorial" class="spinner" style="margin: 16px auto;"></div>
            <div *ngIf="!cargandoHistorial && historial.length === 0" class="text-muted text-sm">Sin eventos registrados</div>
            <div *ngIf="!cargandoHistorial && historial.length > 0" class="timeline">
              <div *ngFor="let h of historial" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="badge badge-clasificada text-sm" style="padding: 2px 8px;">{{ formatAccion(h.accion) }}</span>
                    <span class="text-sm text-muted">{{ h.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <p class="text-sm">Por: {{ h.usuario?.nombre || 'Sistema' }}</p>
                  <p *ngIf="h.observacion" class="text-sm text-muted">{{ h.observacion }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="mostrarClasificar" class="modal-overlay" (click)="mostrarClasificar = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Clasificar Solicitud</h3>
        <div class="form-group">
          <label>Tipo</label>
          <select class="form-control" [(ngModel)]="accionForm.tipo">
            <option *ngFor="let t of tipos" [value]="t.codigo">{{ t.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Observacion</label>
          <textarea class="form-control" [(ngModel)]="accionForm.observacion"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" (click)="mostrarClasificar = false">Cancelar</button>
          <button class="btn btn-primary" (click)="clasificar()" [disabled]="!accionForm.tipo || accionando">Confirmar</button>
        </div>
      </div>
    </div>

    <div *ngIf="mostrarPriorizar" class="modal-overlay" (click)="mostrarPriorizar = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Priorizar Solicitud</h3>
        <div class="form-group">
          <label>Prioridad</label>
          <select class="form-control" [(ngModel)]="accionForm.prioridad">
            <option *ngFor="let p of prioridades" [value]="p">{{ p }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Justificacion</label>
          <textarea class="form-control" [(ngModel)]="accionForm.justificacion" required></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" (click)="mostrarPriorizar = false">Cancelar</button>
          <button class="btn btn-primary" (click)="priorizar()" [disabled]="!accionForm.prioridad || !accionForm.justificacion || accionando">Confirmar</button>
        </div>
      </div>
    </div>

    <div *ngIf="mostrarAsignar" class="modal-overlay" (click)="mostrarAsignar = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Asignar Responsable</h3>
        <div class="form-group">
          <label>Responsable</label>
          <select class="form-control" [(ngModel)]="accionForm.responsableId">
            <option value="" disabled>Seleccione un operador</option>
            <option *ngFor="let op of operadores" [value]="op.id">{{ op.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Observacion</label>
          <textarea class="form-control" [(ngModel)]="accionForm.observacion"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" (click)="mostrarAsignar = false">Cancelar</button>
          <button class="btn btn-primary" (click)="asignar()" [disabled]="!accionForm.responsableId || accionando">Confirmar</button>
        </div>
      </div>
    </div>

    <div *ngIf="mostrarResolver" class="modal-overlay" (click)="mostrarResolver = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Resolver Solicitud</h3>
        <div class="form-group">
          <label>Respuesta</label>
          <textarea class="form-control" [(ngModel)]="accionForm.respuesta" required></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" (click)="mostrarResolver = false">Cancelar</button>
          <button class="btn btn-primary" (click)="resolver()" [disabled]="!accionForm.respuesta || accionando">Confirmar</button>
        </div>
      </div>
    </div>

    <!-- Eliminar Modal -->
    <div *ngIf="mostrarEliminar" class="modal-overlay" (click)="mostrarEliminar = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Eliminar Solicitud</h3>
        <p class="text-muted mb-4">¿Esta seguro de eliminar esta solicitud? Esta accion no se puede deshacer.</p>
        <div class="form-actions">
          <button class="btn btn-secondary" (click)="mostrarEliminar = false">Cancelar</button>
          <button class="btn btn-danger" (click)="eliminar()" [disabled]="accionando">
            {{ accionando ? 'Eliminando...' : 'Confirmar Eliminacion' }}
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="mostrarCerrar" class="modal-overlay" (click)="mostrarCerrar = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Cerrar Solicitud</h3>
        <div class="form-group">
          <label>Observacion de Cierre</label>
          <textarea class="form-control" [(ngModel)]="accionForm.observacionCierre" required></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" (click)="mostrarCerrar = false">Cancelar</button>
          <button class="btn btn-primary" (click)="cerrarSolicitud()" [disabled]="!accionForm.observacionCierre || accionando">Confirmar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detalle-modal { max-width: 800px; }
    .detalle-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-muted);
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .btn-close:hover { background: #f0f2f7; }
    .detalle-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    .detalle-field label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
      margin-bottom: 2px;
      text-transform: uppercase;
    }
    .detalle-field span, .detalle-field code {
      font-size: 0.875rem;
    }
    .detalle-section {
      margin-bottom: 16px;
    }
    .detalle-section label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .detalle-section p {
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--text-primary);
      white-space: pre-wrap;
    }
    .acciones-section {
      margin: 20px 0;
      padding: 16px;
      background: #f8f9fe;
      border-radius: var(--radius-sm);
    }
    .acciones-section h4 {
      font-size: 0.875rem;
      margin-bottom: 12px;
      color: var(--text-secondary);
    }
    .acciones-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .historial-section {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #eef0f6;
    }
    .historial-section h4 {
      font-size: 0.875rem;
      margin-bottom: 16px;
      color: var(--text-secondary);
    }
    .timeline {
      position: relative;
      padding-left: 24px;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #eef0f6;
    }
    .timeline-item {
      position: relative;
      padding-bottom: 16px;
    }
    .timeline-dot {
      position: absolute;
      left: -18px;
      top: 4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--color-primary);
      border: 2px solid white;
    }
    .timeline-content {
      padding: 8px 12px;
      background: #f8f9fe;
      border-radius: var(--radius-sm);
    }
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #eef0f6;
    }
  `]
})
export class SolicitudDetalleComponent implements OnInit {
  @Input() solicitudId!: string;
  @Input() modoOperador = false;
  @Output() close = new EventEmitter<void>();

  solicitud: Solicitud | null = null;
  historial: HistorialAccion[] = [];
  loading = true;
  cargandoHistorial = true;
  accionando = false;

  mostrarClasificar = false;
  mostrarPriorizar = false;
  mostrarAsignar = false;
  mostrarResolver = false;
  mostrarCerrar = false;
  mostrarEliminar = false;

  get puedeEliminar(): boolean {
    if (!this.solicitud) return false;
    return this.solicitud.estado === 'REGISTRADA';
  }

  operadores: { id: string; nombre: string }[] = [];

  accionForm: {
    tipo?: string;
    observacion?: string;
    prioridad?: PrioridadNivel;
    justificacion?: string;
    responsableId?: string;
    respuesta?: string;
    observacionCierre?: string;
  } = {};

  tipos = [
    { codigo: 'REGISTRO_ASIGNATURAS', nombre: 'Registro de Asignaturas' },
    { codigo: 'HOMOLOGACION', nombre: 'Homologacion' },
    { codigo: 'CANCELACION', nombre: 'Cancelacion' },
    { codigo: 'SOLICITUD_CUPO', nombre: 'Solicitud de Cupo' },
    { codigo: 'CONSULTA_ACADEMICA', nombre: 'Consulta Academica' },
    { codigo: 'OTRO', nombre: 'Otro' }
  ];
  prioridades: PrioridadNivel[] = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];

  constructor(
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.solicitudId) {
      return;
    }

    this.cargarSolicitud();
    this.cargarHistorial();
    if (this.modoOperador) {
      this.cargarOperadores();
    }
  }

  cargarSolicitud(): void {
    this.loading = true;
    this.solicitudService.obtener(this.solicitudId).subscribe({
      next: (res: Solicitud) => {
        this.solicitud = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  cargarHistorial(): void {
    this.cargandoHistorial = true;
    this.solicitudService.historial(this.solicitudId).subscribe({
      next: (res: HistorialAccion[]) => {
        this.historial = res;
        this.cargandoHistorial = false;
      },
      error: () => this.cargandoHistorial = false
    });
  }

  cargarOperadores(): void {
    this.usuarioService.listarOperadoresActivos().subscribe({
      next: (res) => {
        this.operadores = res.map(u => ({ id: u.id, nombre: u.nombre }));
      }
    });
  }

  clasificar(): void {
    this.accionando = true;
    this.solicitudService.clasificar(this.solicitudId, {
      tipo: this.accionForm.tipo as any,
      observacion: this.accionForm.observacion
    }).subscribe({
      next: () => {
        this.mostrarClasificar = false;
        this.accionando = false;
        this.recargar();
      },
      error: () => this.accionando = false
    });
  }

  priorizar(): void {
    this.accionando = true;
    this.solicitudService.priorizar(this.solicitudId, {
      prioridad: this.accionForm.prioridad as PrioridadNivel,
      justificacion: this.accionForm.justificacion || ''
    }).subscribe({
      next: () => {
        this.mostrarPriorizar = false;
        this.accionando = false;
        this.recargar();
      },
      error: () => this.accionando = false
    });
  }

  asignar(): void {
    this.accionando = true;
    this.solicitudService.asignar(this.solicitudId, {
      responsableId: this.accionForm.responsableId || '',
      observacion: this.accionForm.observacion
    }).subscribe({
      next: () => {
        this.mostrarAsignar = false;
        this.accionando = false;
        this.recargar();
      },
      error: () => this.accionando = false
    });
  }

  iniciarAtencion(): void {
    this.accionando = true;
    this.solicitudService.iniciarAtencion(this.solicitudId).subscribe({
      next: () => {
        this.accionando = false;
        this.recargar();
      },
      error: () => this.accionando = false
    });
  }

  resolver(): void {
    this.accionando = true;
    this.solicitudService.resolver(this.solicitudId, {
      respuesta: this.accionForm.respuesta || ''
    }).subscribe({
      next: () => {
        this.mostrarResolver = false;
        this.accionando = false;
        this.recargar();
      },
      error: () => this.accionando = false
    });
  }

  cerrarSolicitud(): void {
    this.accionando = true;
    this.solicitudService.cerrar(this.solicitudId, {
      observacionCierre: this.accionForm.observacionCierre || ''
    }).subscribe({
      next: () => {
        this.mostrarCerrar = false;
        this.accionando = false;
        this.recargar();
      },
      error: () => this.accionando = false
    });
  }

  asignarme(): void {
    const user = this.authService.getUsuario();
    if (!user) return;
    this.accionando = true;
    this.solicitudService.asignar(this.solicitudId, {
      responsableId: user.id,
      observacion: 'Me asigno como responsable'
    }).subscribe({
      next: () => {
        this.accionando = false;
        this.recargar();
      },
      error: () => this.accionando = false
    });
  }

  eliminar(): void {
    this.accionando = true;
    this.solicitudService.eliminar(this.solicitudId).subscribe({
      next: () => {
        this.mostrarEliminar = false;
        this.accionando = false;
        this.close.emit();
      },
      error: () => this.accionando = false
    });
  }

  recargar(): void {
    this.accionForm = {};
    this.cargarSolicitud();
    this.cargarHistorial();
  }

  cerrarModal(): void {
    this.close.emit();
  }

  formatEstado(e: string): string { return e.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
  formatTipo(t: string): string { return t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
  formatAccion(a: string): string { return a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
}
