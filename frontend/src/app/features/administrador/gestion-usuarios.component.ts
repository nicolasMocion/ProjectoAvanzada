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
                  <button *ngIf="u.rol !== 'administrador'" class="btn btn-danger btn-sm ml-2" (click)="confirmarEliminar(u)">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div *ngIf="mostrarConfirmacion" class="modal-overlay" (click)="mostrarConfirmacion = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Eliminar Usuario</h3>
        <p class="text-muted mb-4">¿Esta seguro de eliminar a <strong>{{ usuarioAEliminar?.nombre }}</strong>?
        {{ usuarioAEliminar?.rol === 'operador' ? ' Se desasignara de todas las solicitudes a su cargo.' : '' }}
        Esta accion no se puede deshacer.</p>
        <div class="form-actions">
          <button class="btn btn-secondary" (click)="mostrarConfirmacion = false">Cancelar</button>
          <button class="btn btn-danger" (click)="eliminar()" [disabled]="eliminando">
            {{ eliminando ? 'Eliminando...' : 'Confirmar Eliminacion' }}
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="mostrarFormulario" class="modal-overlay" (click)="mostrarFormulario = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Nuevo Usuario</h3>
        <div *ngIf="success" class="alert alert-success">{{ success }}</div>
        <form (ngSubmit)="crearUsuario()">
          <div class="form-group">
            <label for="new-id">Identificación</label>
            <input id="new-id" class="form-control" [class.input-error]="erroresCampo['identificacion']" [(ngModel)]="form.identificacion" name="identificacion" required maxlength="30" />
            <span *ngIf="erroresCampo['identificacion']" class="field-error">{{ erroresCampo['identificacion'] }}</span>
          </div>
          <div class="form-group">
            <label for="new-nombre">Nombre Completo</label>
            <input id="new-nombre" class="form-control" [class.input-error]="erroresCampo['nombre']" [(ngModel)]="form.nombre" name="nombre" required maxlength="120" />
            <span *ngIf="erroresCampo['nombre']" class="field-error">{{ erroresCampo['nombre'] }}</span>
          </div>
          <div class="form-group">
            <label for="new-email">Email</label>
            <input id="new-email" type="email" class="form-control" [class.input-error]="erroresCampo['email']" [(ngModel)]="form.email" name="email" required maxlength="120" />
            <span *ngIf="erroresCampo['email']" class="field-error">{{ erroresCampo['email'] }}</span>
          </div>
          <div class="form-group">
            <label for="new-password">Contraseña</label>
            <input id="new-password" type="password" class="form-control" [class.input-error]="erroresCampo['password']" [(ngModel)]="form.password" name="password" required minlength="8" maxlength="255" />
            <span class="text-sm text-muted">Mínimo 8 caracteres</span>
            <span *ngIf="erroresCampo['password']" class="field-error">{{ erroresCampo['password'] }}</span>
          </div>
          <div class="form-group">
            <label for="new-confirm-password">Confirmar Contraseña</label>
            <input id="new-confirm-password" type="password" class="form-control" [class.input-error]="erroresCampo['confirmPassword']" [(ngModel)]="confirmPassword" name="confirmPassword" required />
            <span *ngIf="erroresCampo['confirmPassword']" class="field-error">{{ erroresCampo['confirmPassword'] }}</span>
          </div>
          <div class="form-group">
            <label for="new-rol">Rol</label>
            <select id="new-rol" class="form-control" [(ngModel)]="form.rol" name="rol" required>
              <option value="estudiante">Estudiante</option>
              <option value="operador">Operador</option>
              <option value="administrador">Administrador</option>
              <option value="docente">Docente</option>
            </select>
          </div>
          <div *ngIf="errorGeneral" class="alert alert-error mt-4">{{ errorGeneral }}</div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="cerrarFormulario()">Cancelar</button>
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
    .field-error {
      display: block;
      font-size: 0.75rem;
      color: #e74c3c;
      margin-top: 2px;
    }
    .input-error {
      border-color: #e74c3c;
    }
    .mt-4 { margin-top: 16px; }
    .ml-2 { margin-left: 8px; }
  `]
})
export class AdminUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = true;
  mostrarFormulario = false;
  mostrarConfirmacion = false;
  creando = false;
  eliminando = false;
  errorGeneral = '';
  success = '';
  usuarioAEliminar: Usuario | null = null;
  confirmPassword = '';
  erroresCampo: Record<string, string> = {};
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
    this.erroresCampo = {};
    this.errorGeneral = '';

    if (this.form.password !== this.confirmPassword) {
      this.erroresCampo['confirmPassword'] = 'Las contraseñas no coinciden.';
      return;
    }

    this.creando = true;
    this.usuarioService.crear(this.form).subscribe({
      next: (res: Usuario) => {
        this.usuarios.push(res);
        this.success = 'Usuario creado exitosamente';
        this.creando = false;
        setTimeout(() => this.cerrarFormulario(), 1500);
      },
      error: (err: any) => {
        this.creando = false;
        if (err.error?.details && typeof err.error.details === 'object' && Object.keys(err.error.details).length > 0) {
          this.erroresCampo = err.error.details;
          this.errorGeneral = '';
        } else {
          this.errorGeneral = err.error?.message || 'Error al crear usuario';
        }
      }
    });
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.success = '';
    this.errorGeneral = '';
    this.erroresCampo = {};
    this.confirmPassword = '';
    this.form = { identificacion: '', nombre: '', email: '', password: '', rol: 'estudiante' };
  }

  toggleActivo(u: Usuario): void {
    this.usuarioService.toggleActivo(u.id).subscribe({
      next: (res: Usuario) => {
        const idx = this.usuarios.findIndex(x => x.id === u.id);
        if (idx >= 0) this.usuarios[idx] = res;
      }
    });
  }

  confirmarEliminar(u: Usuario): void {
    this.usuarioAEliminar = u;
    this.mostrarConfirmacion = true;
  }

  eliminar(): void {
    if (!this.usuarioAEliminar) return;
    this.eliminando = true;
    this.usuarioService.eliminar(this.usuarioAEliminar.id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(x => x.id !== this.usuarioAEliminar!.id);
        this.mostrarConfirmacion = false;
        this.usuarioAEliminar = null;
        this.eliminando = false;
      },
      error: () => this.eliminando = false
    });
  }
}
