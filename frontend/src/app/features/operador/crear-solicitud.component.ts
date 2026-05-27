import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { SugerenciaService } from '../../services/sugerencia.service';
import { UsuarioService } from '../../services/usuario.service';
import { CanalOrigen, SugerenciaResponse, TipoSolicitudCodigo } from '../../models/solicitud.model';

@Component({
  selector: 'app-operador-crear-solicitud',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Nueva Solicitud</h1>
          <p class="text-muted">Registre una solicitud a nombre de un estudiante</p>
        </div>
      </div>

      <div class="card form-card">
        <form (ngSubmit)="onSubmit()">
          <div *ngIf="error" class="alert alert-error">{{ error }}</div>
          <div *ngIf="success" class="alert alert-success">{{ success }}</div>

          <div class="form-group">
            <label for="tipo">Tipo de Solicitud</label>
            <select id="tipo" class="form-control" [(ngModel)]="tipo" name="tipo" required>
              <option value="" disabled>Seleccione un tipo</option>
              <option *ngFor="let t of tipos" [value]="t.codigo">{{ t.nombre }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              class="form-control"
              [(ngModel)]="descripcion"
              name="descripcion"
              placeholder="Describa detalladamente la solicitud..."
              required
              maxlength="2000"
            ></textarea>
            <span class="text-sm text-muted">{{ descripcion.length }}/2000</span>
          </div>

          <div class="form-group">
            <label for="canal">Canal de Origen</label>
            <select id="canal" class="form-control" [(ngModel)]="canal" name="canal" required>
              <option value="" disabled>Seleccione un canal</option>
              <option *ngFor="let c of canales" [value]="c">{{ c }}</option>
            </select>
          </div>

          <fieldset class="form-fieldset">
            <legend>Estudiante Solicitante</legend>

            <div class="form-group">
              <label for="identificacion">Identificación del estudiante</label>
              <div class="input-group">
                <input
                  id="identificacion"
                  type="text"
                  class="form-control"
                  [(ngModel)]="identificacion"
                  name="identificacion"
                  placeholder="Cédula o carné del estudiante"
                  (blur)="buscarEstudiante()"
                />
                <button type="button" class="btn btn-secondary" (click)="buscarEstudiante()" [disabled]="!identificacion || buscando">
                  {{ buscando ? 'Buscando...' : 'Buscar' }}
                </button>
              </div>
            </div>

            <div *ngIf="estudianteEncontrado" class="card card-highlight mt-4">
              <div class="card-header">
                <h3>Estudiante encontrado</h3>
                <span class="badge badge-success">Confirmado</span>
              </div>
              <div class="card-body">
                <p><strong>Nombre:</strong> {{ estudianteEncontrado.nombre }}</p>
                <p><strong>Identificación:</strong> {{ estudianteEncontrado.identificacion }}</p>
                <p><strong>Email:</strong> {{ estudianteEncontrado.email }}</p>
              </div>
            </div>

            <div *ngIf="noEncontrado" class="alert alert-error mt-4">
              No se encontró ningún estudiante registrado con esa identificación.
            </div>
          </fieldset>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="sugerirIA()" [disabled]="!descripcion || cargandoIA">
              {{ cargandoIA ? 'Consultando IA...' : 'Sugerir con IA' }}
            </button>
            <div class="flex gap-2">
              <button type="button" class="btn btn-secondary" routerLink="/operador/solicitudes">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="enviando || !estudianteEncontrado">
                {{ enviando ? 'Enviando...' : 'Registrar Solicitud' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div *ngIf="sugerencia" class="card" style="margin-top: 16px;">
        <div class="card-header">
          <h2>Sugerencia IA</h2>
          <span class="badge" [class.badge-success]="sugerencia.confidence > 0.7">Confianza: {{ (sugerencia.confidence * 100).toFixed(0) }}%</span>
        </div>
        <p class="text-sm">Tipo sugerido: <strong>{{ formatTipo(sugerencia.suggestedType) }}</strong></p>
        <p class="text-sm">Prioridad sugerida: <strong>{{ sugerencia.suggestedPriority }}</strong></p>
        <button class="btn btn-sm btn-secondary mt-4" (click)="aplicarSugerencia()">Aplicar sugerencia</button>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 800px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.5rem; color: white; }
    .page-header p { color: rgba(255,255,255,0.7); }
    .form-card { max-width: 700px; }
    .form-fieldset {
      border: 1px solid #dde1e8;
      border-radius: var(--radius-md);
      padding: 16px;
      margin-bottom: 16px;
    }
    .form-fieldset legend {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      padding: 0 8px;
    }
    .input-group {
      display: flex;
      gap: 8px;
    }
    .input-group input { flex: 1; }
    .card-highlight {
      border: 2px solid var(--color-success);
      background: #f0fdf4;
    }
    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eef0f6;
    }
  `]
})
export class OperadorCrearSolicitudComponent {
  tipos = [
    { codigo: 'REGISTRO_ASIGNATURAS' as TipoSolicitudCodigo, nombre: 'Registro de Asignaturas' },
    { codigo: 'HOMOLOGACION' as TipoSolicitudCodigo, nombre: 'Homologación' },
    { codigo: 'CANCELACION' as TipoSolicitudCodigo, nombre: 'Cancelación' },
    { codigo: 'SOLICITUD_CUPO' as TipoSolicitudCodigo, nombre: 'Solicitud de Cupo' },
    { codigo: 'CONSULTA_ACADEMICA' as TipoSolicitudCodigo, nombre: 'Consulta Académica' },
    { codigo: 'OTRO' as TipoSolicitudCodigo, nombre: 'Otro' },
  ];
  canales: CanalOrigen[] = ['CSU', 'CORREO', 'SAC', 'TELEFONICO', 'PRESENCIAL', 'OTRO'];

  tipo: TipoSolicitudCodigo | '' = '';
  descripcion = '';
  canal: CanalOrigen | '' = '';
  enviando = false;
  cargandoIA = false;
  buscando = false;
  error = '';
  success = '';
  sugerencia: SugerenciaResponse | null = null;

  identificacion = '';
  estudianteEncontrado: { id: string; nombre: string; identificacion: string; email: string } | null = null;
  noEncontrado = false;

  constructor(
    private solicitudService: SolicitudService,
    private sugerenciaService: SugerenciaService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  buscarEstudiante(): void {
    if (!this.identificacion || this.identificacion.trim().length === 0) {
      return;
    }
    this.buscando = true;
    this.estudianteEncontrado = null;
    this.noEncontrado = false;
    this.error = '';

    this.usuarioService.buscarPorIdentificacion(this.identificacion.trim()).subscribe({
      next: (res) => {
        if (res) {
          this.estudianteEncontrado = { ...res, identificacion: this.identificacion.trim(), email: '' };
          this.noEncontrado = false;
        } else {
          this.estudianteEncontrado = null;
          this.noEncontrado = true;
        }
        this.buscando = false;
      },
      error: () => {
        this.estudianteEncontrado = null;
        this.noEncontrado = true;
        this.buscando = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.tipo || !this.descripcion || !this.canal) {
      this.error = 'Complete todos los campos obligatorios';
      return;
    }
    if (!this.estudianteEncontrado) {
      this.error = 'Debe buscar y confirmar un estudiante registrado';
      return;
    }

    this.enviando = true;
    this.error = '';

    const body: any = {
      tipo: this.tipo as TipoSolicitudCodigo,
      descripcion: this.descripcion,
      canalOrigen: this.canal as CanalOrigen,
      solicitanteId: this.estudianteEncontrado.id
    };

    this.solicitudService.crear(body).subscribe({
      next: () => {
        this.success = 'Solicitud registrada exitosamente';
        this.enviando = false;
        setTimeout(() => this.router.navigateByUrl('/operador/solicitudes'), 1500);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al crear solicitud';
        this.enviando = false;
      }
    });
  }

  sugerirIA(): void {
    this.cargandoIA = true;
    this.sugerencia = null;
    this.sugerenciaService.clasificar(this.descripcion).subscribe({
      next: (res: SugerenciaResponse) => { this.sugerencia = res; this.cargandoIA = false; },
      error: () => this.cargandoIA = false
    });
  }

  aplicarSugerencia(): void {
    if (this.sugerencia) {
      this.tipo = this.sugerencia.suggestedType;
    }
  }

  formatTipo(t: string): string { return t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
}
