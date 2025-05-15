import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, Observable, of } from 'rxjs';
import { LigasService } from '../services/ligas.service';

@Injectable({
  providedIn: 'root'
})
export class LigasGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private ligasService: LigasService,
  ) {}

  canActivate(): Observable<boolean> {
    const usuario = this.authService.getUsuario();

    if (!usuario) {
      console.warn('⛔ Usuario no autenticado. Redirigiendo a /auth/login');
      this.router.navigate(['/auth/login']);
      return of(false);
    }

    return this.ligasService.obtenerLigaDelUsuario(usuario.id).pipe(
      map(liga => {
        if (liga) {
          console.log('✅ Usuario tiene liga. Acceso permitido.');
          this.authService.setLiga(liga);
          this.authService.setLigaId(liga.id);
          return true;
        } else {
          console.warn('🚫 Usuario sin liga. Redirigiendo a /ligas');
          this.router.navigate(['/ligas']);
          return false;
        }
      }),
      catchError(err => {
        console.error('❌ Error al verificar liga del usuario:', err);
        this.router.navigate(['/ligas']);
        return of(false);
      })
    );
  }
}
