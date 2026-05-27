import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { AuthService } from '../../services/auth.service';
import { PagedResponse, Solicitud } from '../../models/solicitud.model';

@Component({
  selector: 'app-operador-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1>Panel del Operador</h1>
          <p class="text-muted">Bienvenido, {{ user?.nombre }}</p>
        </div>
        <a routerLink="/operador/solicitudes" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
          Gestionar Solicitudes
        </a>
      </div>

      <div class="grid grid-4 mb-4">
        <div class="stat-card">
          <div class="stat-value">{{ total }}</div>
          <div class="stat-label">Total Solicitudes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pendientes }}</div>
          <div class="stat-label">Por Clasificar</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ enAtencion }}</div>
          <div class="stat-label">En Atención</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ atendidas }}</div>
          <div class="stat-label">Atendidas/Cerradas</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Solicitudes Recientes</h2>
        </div>
        <div *ngIf="loading" class="spinner"></div>
        <div *ngIf="!loading && solicitudes.length === 0" class="empty-state">
          <p>No hay solicitudes registradas</p>
        </div>
        <div *ngIf="!loading && solicitudes.length > 0" class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Solicitante</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Responsable</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of solicitudes.slice(0, 10)">
                <td><code>{{ s.id | slice:0:8 }}...</code></td>
                <td>{{ s.solicitante.nombre }}</td>
                <td class="text-sm">{{ formatTipo(s.tipo) }}</td>
                <td><span class="badge badge-{{ s.estado | lowercase }}">{{ formatEstado(s.estado) }}</span></td>
                <td>
                  <span *ngIf="s.prioridad?.nivel" class="badge badge-{{ s.prioridad!.nivel | lowercase }}">{{ s.prioridad!.nivel }}</span>
                  <span *ngIf="!s.prioridad?.nivel" class="text-muted">—</span>
                </td>
                <td class="text-sm">{{ s.responsable?.nombre || '—' }}</td>
                <td class="text-sm">{{ s.fechaCreacion | date:'dd/MM/yyyy' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 24px; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-header h1 { font-size: 1.5rem; color: white; }
    .page-header p { color: rgba(255,255,255,0.7); }
  `]
})
export class OperadorDashboardComponent implements OnInit {
  user = this.auth.getUsuario();
  solicitudes: Solicitud[] = [];
  loading = true;
  total = 0; pendientes = 0; enAtencion = 0; atendidas = 0;

  constructor(
    private solicitudService: SolicitudService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.solicitudService.listar({ size: 50 }).subscribe({
      next: (res: PagedResponse<Solicitud>) => {
        this.solicitudes = res.items;
        this.total = res.total;
        this.pendientes = res.items.filter(s => s.estado === 'REGISTRADA').length;
        this.enAtencion = res.items.filter(s => s.estado === 'EN_ATENCION').length;
        this.atendidas = res.items.filter(s => s.estado === 'ATENDIDA' || s.estado === 'CERRADA').length;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  formatTipo(t: string): string { return t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
  formatEstado(e: string): string { return e.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
}
