import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { UsuarioService } from '../../services/usuario.service';
import { PagedResponse, Solicitud } from '../../models/solicitud.model';

@Component({
  selector: 'app-solicitudes-por-estudiante',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Solicitudes por Estudiante</h1>
          <p class="text-muted">Busque un estudiante para ver sus solicitudes</p>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="search-section">
            <label for="searchId">Identificación del estudiante</label>
            <div class="input-group">
              <input
                id="searchId"
                type="text"
                class="form-control"
                [(ngModel)]="identificacion"
                placeholder="Cédula o carné"
                (keyup.enter)="buscarEstudiante()"
              />
              <button type="button" class="btn btn-primary" (click)="buscarEstudiante()" [disabled]="!identificacion || buscando">
                {{ buscando ? 'Buscando...' : 'Buscar' }}
              </button>
            </div>
          </div>

          <div *ngIf="estudiante" class="student-info mt-4">
            <div class="card-header">
              <h3>{{ estudiante.nombre }}</h3>
              <span class="badge badge-success">{{ estudiante.identificacion }}</span>
            </div>
            <p class="text-sm text-muted">{{ estudiante.email }}</p>
          </div>

          <div *ngIf="noEncontrado" class="alert alert-error mt-4">
            No se encontró ningún estudiante registrado con esa identificación.
          </div>
        </div>
      </div>

      <div *ngIf="estudiante" class="card mt-4">
        <div class="card-header">
          <h2>Solicitudes</h2>
          <span class="text-muted text-sm">{{ solicitudes.length }} resultado(s)</span>
        </div>

        <div *ngIf="cargandoSolicitudes" class="spinner"></div>

        <div *ngIf="!cargandoSolicitudes && solicitudes.length === 0" class="empty-state">
          <p>Este estudiante no tiene solicitudes registradas.</p>
        </div>

        <div *ngIf="!cargandoSolicitudes && solicitudes.length > 0" class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Responsable</th>
                <th>Canal</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of solicitudes">
                <td><code>{{ s.id | slice:0:8 }}...</code></td>
                <td class="text-sm">{{ formatTipo(s.tipo) }}</td>
                <td><span class="badge badge-{{ s.estado | lowercase }}">{{ formatEstado(s.estado) }}</span></td>
                <td>
                  <span *ngIf="s.prioridad?.nivel" class="badge badge-{{ s.prioridad!.nivel | lowercase }}">{{ s.prioridad!.nivel }}</span>
                  <span *ngIf="!s.prioridad?.nivel" class="text-muted">&mdash;</span>
                </td>
                <td class="text-sm">{{ s.responsable?.nombre || '&mdash;' }}</td>
                <td class="text-sm">{{ s.canalOrigen }}</td>
                <td class="text-sm">{{ s.fechaCreacion | date:'dd/MM/yyyy' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.5rem; color: white; }
    .page-header p { color: rgba(255,255,255,0.7); }
    .search-section { margin-bottom: 0; }
    .search-section label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-secondary); font-size: 0.875rem; }
    .input-group { display: flex; gap: 8px; }
    .input-group input { flex: 1; }
    .student-info {
      padding: 16px;
      background: #f0fdf4;
      border: 2px solid var(--color-success);
      border-radius: var(--radius-md);
    }
  `]
})
export class SolicitudesPorEstudianteComponent {
  identificacion = '';
  buscando = false;
  cargandoSolicitudes = false;
  noEncontrado = false;
  estudiante: { id: string; nombre: string; identificacion: string; email: string } | null = null;
  solicitudes: Solicitud[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private solicitudService: SolicitudService
  ) {}

  buscarEstudiante(): void {
    if (!this.identificacion || this.identificacion.trim().length === 0) return;

    this.buscando = true;
    this.noEncontrado = false;
    this.estudiante = null;
    this.solicitudes = [];

    this.usuarioService.buscarPorIdentificacion(this.identificacion.trim()).subscribe({
      next: (res) => {
        this.estudiante = res;
        this.cargarSolicitudes();
        this.buscando = false;
      },
      error: () => {
        this.noEncontrado = true;
        this.buscando = false;
      }
    });
  }

  private cargarSolicitudes(): void {
    if (!this.estudiante) return;
    this.cargandoSolicitudes = true;

    this.solicitudService.listar({ solicitanteId: this.estudiante.id, size: 100 }).subscribe({
      next: (res: PagedResponse<Solicitud>) => {
        this.solicitudes = res.items;
        this.cargandoSolicitudes = false;
      },
      error: () => this.cargandoSolicitudes = false
    });
  }

  formatTipo(t: string): string { return t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
  formatEstado(e: string): string { return e.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
}
