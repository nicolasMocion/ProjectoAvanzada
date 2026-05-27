import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario, CrearUsuarioRequest } from '../../models/usuario.model';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Gestión de Usuarios</h1>
        <p class="text-muted">Administra los usuarios del sistema</p>
        <button class="btn btn-primary" (click)="mostrarFormulario = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Usuario
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Usuarios del Sistema</h2>
          <span class="text-sm text-muted">{{ usuarios.length }} registros</span>
        </div>
        <div *ngIf="loading" class="spinner"></div>
        <div *ngIf="!loading && usuarios.length === 0" class="empty-state">
          <p>No hay usuarios registrados</p>
        </div>
        <div *ngIf="!loading && usuarios.length > 0" class="table-container">
          <table>
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of usuarios">
                <td><code>{{ u.identificacion }}</code></td>
                <td>{{ u.nombre }}</td>
                <td class="text-sm">{{ u.email }}</td>
                <td><span class="badge badge-{{ u.rol | lowercase }}">{{ u.rol }}</span></td>
                <td>
                  <span class="badge" [class.badge-success]="u.activo" [class.badge-cerrada]="!u.activo">
                    {{ u.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm" [class.btn-secondary]="u.activo" [class.btn-danger]="!u.activo" (click)="toggleActivo(u)">
                    {{ u.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div *ngIf="mostrarFormulario" class="modal-overlay" (click)="mostrarFormulario = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Nuevo Usuario</h3>
        <div *ngIf="error" class="alert alert-error">{{ error }}</div>
        <div *ngIf="success" class="alert alert-success">{{ success }}</div>
        <form (ngSubmit)="crearUsuario()">
          <div class="form-group">
            <label>Identificación</label>
            <input class="form-control" [(ngModel)]="form.identificacion" name="identificacion" required />
          </div>
          <div class="form-group">
            <label>Nombre Completo</label>
            <input class="form-control" [(ngModel)]="form.nombre" name="nombre" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control" [(ngModel)]="form.email" name="email" required />
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" class="form-control" [(ngModel)]="form.password" name="password" required />
          </div>
          <div class="form-group">
            <label>Rol</label>
            <select class="form-control" [(ngModel)]="form.rol" name="rol" required>
              <option value="ESTUDIANTE">Estudiante</option>
              <option value="OPERADOR">Operador</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="DOCENTE">Docente</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="mostrarFormulario = false">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="creando">{{ creando ? 'Creando...' : 'Crear Usuario' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .page-header h1 { font-size: 1.5rem; color: white; }
    .page-header p { color: rgba(255,255,255,0.7); }
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
export class AdminUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = true;
  mostrarFormulario = false;
  creando = false;
  error = '';
  success = '';
  form: CrearUsuarioRequest = {
    identificacion: '', nombre: '', email: '', password: '', rol: 'estudiante'
  };

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.usuarioService.listar().subscribe({
      next: (res: Usuario[]) => { this.usuarios = res; this.loading = false; },
      error: () => this.loading = false
    });
  }

  crearUsuario(): void {
    this.creando = true;
    this.error = '';
    this.usuarioService.crear(this.form).subscribe({
      next: (res: Usuario) => {
        this.usuarios.push(res);
        this.success = 'Usuario creado exitosamente';
        this.creando = false;
        setTimeout(() => {
          this.mostrarFormulario = false;
          this.success = '';
          this.form = { identificacion: '', nombre: '', email: '', password: '', rol: 'estudiante' };
        }, 1500);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al crear usuario';
        this.creando = false;
      }
    });
  }

  toggleActivo(u: Usuario): void {
    this.usuarioService.toggleActivo(u.id).subscribe({
      next: (res: Usuario) => {
        const idx = this.usuarios.findIndex(x => x.id === u.id);
        if (idx >= 0) this.usuarios[idx] = res;
      }
    });
  }
}
