import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { AuthService } from '../../services/auth.service';
import { PagedResponse, Solicitud } from '../../models/solicitud.model';
import { SolicitudDetalleComponent } from '../solicitud-detalle/solicitud-detalle.component';

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SolicitudDetalleComponent],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1>Panel del Estudiante</h1>
          <p class="text-muted">Bienvenido, {{ user?.nombre }}</p>
        </div>
        <a routerLink="/estudiante/crear" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Solicitud
        </a>
      </div>

      <div class="grid grid-4 mb-4">
        <div class="stat-card">
          <div class="stat-value">{{ total }}</div>
          <div class="stat-label">Total Solicitudes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pendientes }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ enAtencion }}</div>
          <div class="stat-label">En Atención</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ cerradas }}</div>
          <div class="stat-label">Cerradas</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Mis Solicitudes Recientes</h2>
          <a routerLink="/estudiante/solicitudes" class="btn btn-secondary btn-sm">Ver todas</a>
        </div>
        <div *ngIf="loading" class="spinner"></div>
        <div *ngIf="!loading && solicitudes.length === 0" class="empty-state">
          <p>No tienes solicitudes registradas</p>
          <a routerLink="/estudiante/crear" class="btn btn-primary btn-sm">Crear primera solicitud</a>
        </div>
        <div *ngIf="!loading && solicitudes.length > 0" class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of solicitudes">
                <td><code>{{ s.id | slice:0:8 }}...</code></td>
                <td>{{ formatTipo(s.tipo) }}</td>
                <td><span class="badge badge-{{ s.estado | lowercase }}">{{ formatEstado(s.estado) }}</span></td>
                <td>
                  <span *ngIf="s.prioridad?.nivel" class="badge badge-{{ s.prioridad!.nivel | lowercase }}">{{ s.prioridad!.nivel }}</span>
                  <span *ngIf="!s.prioridad?.nivel" class="text-muted">—</span>
                </td>
                <td class="text-sm">{{ s.fechaCreacion | date:'short' }}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" (click)="verDetalle(s)">Ver</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <app-solicitud-detalle *ngIf="detalleId" [solicitudId]="detalleId" (close)="detalleId = null"></app-solicitud-detalle>
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
export class EstudianteDashboardComponent implements OnInit {
  user = this.auth.getUsuario();
  solicitudes: Solicitud[] = [];
  loading = true;
  total = 0; pendientes = 0; enAtencion = 0; cerradas = 0;
  detalleId: string | null = null;

  constructor(
    private solicitudService: SolicitudService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.solicitudService.listar({ size: 50 }).subscribe({
      next: (res: PagedResponse<Solicitud>) => {
        this.solicitudes = res.items;
        this.total = res.total;
        this.pendientes = res.items.filter(s => s.estado === 'REGISTRADA' || s.estado === 'CLASIFICADA').length;
        this.enAtencion = res.items.filter(s => s.estado === 'EN_ATENCION').length;
        this.cerradas = res.items.filter(s => s.estado === 'CERRADA').length;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  formatTipo(t: string): string { return t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
  formatEstado(e: string): string { return e.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
  verDetalle(s: Solicitud): void { this.detalleId = s.id; }
}
