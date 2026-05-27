import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.auth.isLoggedIn()) {
      return this.router.parseUrl('/login');
    }
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: import('@angular/router').ActivatedRouteSnapshot): boolean | UrlTree {
    const allowedRoles = route.data['roles'] as RolUsuario[];
    const userRole = this.auth.getRol();
    if (!userRole || !allowedRoles.includes(userRole)) {
      return this.router.parseUrl(this.auth.getRoleRoute());
    }
    return true;
  }
}
