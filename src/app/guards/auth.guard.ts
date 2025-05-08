/**
 * Guard que evita el acceso a rutas protegidas si el usuario no ha iniciado sesión.
 * Solo actúa en el frontend: controla la navegación, pero no protege los datos del backend.
 */

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    } else {
      console.warn('No logueado. Redirigiendo a /auth/login');
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
