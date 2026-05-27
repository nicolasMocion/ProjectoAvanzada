import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'estudiante',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['estudiante'] },
    loadComponent: () => import('./layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/estudiante/dashboard.component').then(m => m.EstudianteDashboardComponent) },
      { path: 'crear', loadComponent: () => import('./features/estudiante/crear-solicitud.component').then(m => m.CrearSolicitudComponent) },
      { path: 'solicitudes', loadComponent: () => import('./features/estudiante/mis-solicitudes.component').then(m => m.MisSolicitudesComponent) },
    ]
  },
  {
    path: 'operador',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['operador'] },
    loadComponent: () => import('./layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/operador/dashboard.component').then(m => m.OperadorDashboardComponent) },
      { path: 'solicitudes', loadComponent: () => import('./features/operador/gestion-solicitudes.component').then(m => m.OperadorGestionComponent) },
    ]
  },
  {
    path: 'administrador',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['administrador'] },
    loadComponent: () => import('./layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/administrador/dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'usuarios', loadComponent: () => import('./features/administrador/gestion-usuarios.component').then(m => m.AdminUsuariosComponent) },
      { path: 'solicitudes', loadComponent: () => import('./features/administrador/gestion-solicitudes.component').then(m => m.AdminSolicitudesComponent) },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
