
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const usuario = this.auth.getUsuario();

    if (usuario) {
      return true;
    } else {
      console.warn('⛔ Usuario no autenticado. Redirigiendo a /auth/login');
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
