import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { SugerenciaService } from '../../services/sugerencia.service';
import { CanalOrigen, SugerenciaResponse, TipoSolicitudCodigo } from '../../models/solicitud.model';

@Component({
  selector: 'app-crear-solicitud',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Nueva Solicitud</h1>
          <p class="text-muted">Complete los campos para registrar una nueva solicitud académica</p>
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
              placeholder="Describa detalladamente su solicitud..."
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

          <div class="form-group">
            <label for="fechaLimite">Fecha Límite (opcional)</label>
            <input id="fechaLimite" type="date" class="form-control" [(ngModel)]="fechaLimite" name="fechaLimite" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="sugerirIA()" [disabled]="!descripcion || cargandoIA">
              {{ cargandoIA ? 'Consultando IA...' : 'Sugerir con IA' }}
            </button>
            <div class="flex gap-2">
              <button type="button" class="btn btn-secondary" routerLink="/estudiante">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="enviando">
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
    .form-card { max-width: 600px; }
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
export class CrearSolicitudComponent {
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
  fechaLimite = '';
  enviando = false;
  cargandoIA = false;
  error = '';
  success = '';
  sugerencia: SugerenciaResponse | null = null;

  constructor(
    private solicitudService: SolicitudService,
    private sugerenciaService: SugerenciaService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.tipo || !this.descripcion || !this.canal) {
      this.error = 'Complete todos los campos obligatorios';
      return;
    }
    this.enviando = true;
    this.error = '';
    this.solicitudService.crear({
      tipo: this.tipo as TipoSolicitudCodigo,
      descripcion: this.descripcion,
      canalOrigen: this.canal as CanalOrigen,
      fechaLimite: this.fechaLimite || undefined
    }).subscribe({
      next: () => {
        this.success = 'Solicitud registrada exitosamente';
        this.enviando = false;
        setTimeout(() => this.router.navigateByUrl('/estudiante/solicitudes'), 1500);
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
