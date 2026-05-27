import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h1>Gestión de Solicitudes</h1>
          <p class="login-subtitle">Sistema de Gestión Académica</p>
        </div>

        <div *ngIf="error" class="login-error">{{ error }}</div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              class="form-control"
              placeholder="ejemplo@correo.com"
              [(ngModel)]="email"
              name="email"
              required
              autocomplete="email"
            />
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              class="form-control"
              placeholder="Ingrese su contraseña"
              [(ngModel)]="password"
              name="password"
              required
              autocomplete="current-password"
            />
          </div>
          <button type="submit" class="btn btn-primary login-btn" [disabled]="loading">
            <span *ngIf="loading" class="spinner-sm"></span>
            {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div class="login-footer">
          <p class="text-sm text-muted">Usuarios de prueba:</p>
          <div class="test-users">
            <span>estudiante.demo&#64;example.com</span>
            <span>operador.demo&#64;example.com</span>
            <span>admin.demo&#64;example.com</span>
            <span class="text-muted">Contraseña: CambioSeguro123!</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .login-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: var(--radius-xl);
      padding: 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      width: 64px;
      height: 64px;
      background: var(--gradient-1);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
    }
    .login-header h1 {
      font-size: 1.5rem;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .login-subtitle {
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .login-form .form-group {
      margin-bottom: 20px;
    }
    .login-btn {
      width: 100%;
      justify-content: center;
      padding: 12px;
      font-size: 1rem;
      margin-top: 8px;
    }
    .login-footer {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #eef0f6;
      text-align: center;
    }
    .test-users {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 8px;
      font-family: monospace;
    }
    .spinner-sm {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin-right: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Por favor ingrese correo y contraseña';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl(this.auth.getRoleRoute());
      },
      error: (err: { status?: number }) => {
        this.error = err.status === 401
          ? 'Credenciales inválidas. Intente de nuevo.'
          : 'Error al conectar con el servidor. Verifique que el backend esté activo.';
        this.loading = false;
      }
    });
  }
}
