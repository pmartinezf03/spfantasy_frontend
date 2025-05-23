import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RedirigirSiLogueadoGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      console.log('🔁 Usuario ya logueado. Redirigiendo a /inicio');
      this.router.navigate(['/inicio']);
      return false;
    }

    return true;
  }
}
