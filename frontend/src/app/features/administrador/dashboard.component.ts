import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { PagedResponse, Solicitud } from '../../models/solicitud.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1>Panel del Administrador</h1>
          <p class="text-muted">Bienvenido, {{ user?.nombre }}</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="/administrador/usuarios" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Usuarios
          </a>
          <a routerLink="/administrador/solicitudes" class="btn btn-secondary" style="background:rgba(255,255,255,0.15);color:white;border-color:rgba(255,255,255,0.3);">
            Solicitudes
          </a>
        </div>
      </div>

      <div class="grid grid-4 mb-4">
        <div class="stat-card">
          <div class="stat-value">{{ totalSolicitudes }}</div>
          <div class="stat-label">Total Solicitudes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ usuariosActivos }}</div>
          <div class="stat-label">Usuarios Activos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pendientes }}</div>
          <div class="stat-label">Solicitudes Pendientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ operadores }}</div>
          <div class="stat-label">Operadores</div>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <div class="card-header">
            <h2>Usuarios del Sistema</h2>
            <a routerLink="/administrador/usuarios" class="btn btn-secondary btn-sm">Gestionar</a>
          </div>
          <div *ngIf="loadingUsers" class="spinner"></div>
          <div *ngIf="!loadingUsers" class="table-container">
            <table>
              <thead><tr><th>Nombre</th><th>Rol</th><th>Estado</th></tr></thead>
              <tbody>
                <tr *ngFor="let u of usuarios.slice(0, 5)">
                  <td class="text-sm">{{ u.nombre }}</td>
                  <td><span class="badge badge-{{ u.rol | lowercase }}">{{ u.rol }}</span></td>
                  <td>
                    <span class="badge" [class.badge-success]="u.activo" [class.badge-cerrada]="!u.activo">
                      {{ u.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h2>Solicitudes Recientes</h2>
            <a routerLink="/administrador/solicitudes" class="btn btn-secondary btn-sm">Ver todas</a>
          </div>
          <div *ngIf="loadingSols" class="spinner"></div>
          <div *ngIf="!loadingSols" class="table-container">
            <table>
              <thead><tr><th>Solicitante</th><th>Estado</th><th>Prioridad</th></tr></thead>
              <tbody>
                <tr *ngFor="let s of solicitudes.slice(0, 5)">
                  <td class="text-sm">{{ s.solicitante?.nombre || s.solicitanteNombre || '—' }}</td>
                  <td><span class="badge badge-{{ s.estado | lowercase }}">{{ formatEstado(s.estado) }}</span></td>
                  <td>
                    <span *ngIf="s.prioridad?.nivel" class="badge badge-{{ s.prioridad!.nivel | lowercase }}">{{ s.prioridad!.nivel }}</span>
                    <span *ngIf="!s.prioridad?.nivel" class="text-muted">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
export class AdminDashboardComponent implements OnInit {
  user = this.auth.getUsuario();
  usuarios: Usuario[] = [];
  solicitudes: Solicitud[] = [];
  loadingUsers = true;
  loadingSols = true;
  totalSolicitudes = 0; usuariosActivos = 0; pendientes = 0; operadores = 0;

  constructor(
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.solicitudService.listar({ size: 50 }).subscribe({
      next: (res: PagedResponse<Solicitud>) => {
        this.solicitudes = res.items;
        this.totalSolicitudes = res.total;
        this.pendientes = res.items.filter(s => s.estado === 'REGISTRADA' || s.estado === 'CLASIFICADA').length;
        this.loadingSols = false;
      },
      error: () => this.loadingSols = false
    });
    this.usuarioService.listar().subscribe({
      next: (res: Usuario[]) => {
        this.usuarios = res;
        this.usuariosActivos = res.filter(u => u.activo).length;
        this.operadores = res.filter(u => u.rol === 'operador').length;
        this.loadingUsers = false;
      },
      error: () => this.loadingUsers = false
    });
  }

  formatEstado(e: string): string { return e.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
}
