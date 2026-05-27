import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import { PagedResponse, Solicitud } from '../../models/solicitud.model';
import { SolicitudDetalleComponent } from '../solicitud-detalle/solicitud-detalle.component';

@Component({
  selector: 'app-operador-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule, SolicitudDetalleComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Gestión de Solicitudes</h1>
        <p class="text-muted">Administra todas las solicitudes académicas</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Todas las Solicitudes</h2>
          <span class="text-sm text-muted">{{ total }} registros</span>
        </div>

        <div class="filter-bar">
          <select class="form-control filter-select" [(ngModel)]="filtroEstado" (change)="filtrar()">
            <option value="">Todos los estados</option>
            <option value="REGISTRADA">Registrada</option>
            <option value="CLASIFICADA">Clasificada</option>
            <option value="EN_ATENCION">En Atención</option>
            <option value="ATENDIDA">Atendida</option>
            <option value="CERRADA">Cerrada</option>
          </select>
          <select class="form-control filter-select" [(ngModel)]="filtroPrioridad" (change)="filtrar()">
            <option value="">Todas las prioridades</option>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </select>
        </div>

        <div *ngIf="loading" class="spinner"></div>
        <div *ngIf="!loading && filtered.length === 0" class="empty-state">
          <p>No se encontraron solicitudes</p>
        </div>
        <div *ngIf="!loading && filtered.length > 0" class="table-container">
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of filtered">
                <td><code>{{ s.id | slice:0:8 }}...</code></td>
                <td>{{ s.solicitante?.nombre || s.solicitanteNombre || '—' }}</td>
                <td class="text-sm">{{ formatTipo(s.tipo) }}</td>
                <td><span class="badge badge-{{ s.estado | lowercase }}">{{ formatEstado(s.estado) }}</span></td>
                <td>
                  <span *ngIf="s.prioridad?.nivel" class="badge badge-{{ s.prioridad!.nivel | lowercase }}">{{ s.prioridad!.nivel }}</span>
                  <span *ngIf="!s.prioridad?.nivel" class="text-muted">—</span>
                </td>
                <td class="text-sm">{{ s.responsable?.nombre || '—' }}</td>
                <td class="text-sm">{{ s.fechaCreacion | date:'dd/MM/yyyy' }}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" (click)="verDetalle(s)">Gestionar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <app-solicitud-detalle *ngIf="detalleId" [solicitudId]="detalleId" [modoOperador]="true" (close)="detalleId = null; cargar()"></app-solicitud-detalle>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.5rem; color: white; }
    .page-header p { color: rgba(255,255,255,0.7); }
    .filter-bar {
      margin-bottom: 16px;
      display: flex;
      gap: 12px;
    }
    .filter-select { max-width: 220px; }
  `]
})
export class OperadorGestionComponent implements OnInit {
  solicitudes: Solicitud[] = [];
  filtered: Solicitud[] = [];
  loading = true;
  total = 0;
  filtroEstado = '';
  filtroPrioridad = '';
  detalleId: string | null = null;

  constructor(private solicitudService: SolicitudService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.solicitudService.listar({ size: 100 }).subscribe({
      next: (res: PagedResponse<Solicitud>) => {
        this.solicitudes = res.items;
        this.total = res.total;
        this.filtrar();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filtrar(): void {
    this.filtered = this.solicitudes.filter(s => {
      if (this.filtroEstado && s.estado !== this.filtroEstado) return false;
      if (this.filtroPrioridad && s.prioridad?.nivel !== this.filtroPrioridad) return false;
      return true;
    });
  }

  formatTipo(t: string): string { return t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
  formatEstado(e: string): string { return e.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
  verDetalle(s: Solicitud): void { this.detalleId = s.id; }
}
