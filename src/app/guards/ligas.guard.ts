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
    const userId = this.authService.getUserId();

    if (!userId) {
      console.warn('⛔ Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
      return of(false);
    }

    return this.ligasService.obtenerLigaDelUsuario(userId).pipe(
      map(liga => {
        if (liga) {
          this.authService.setLigaId(liga.id);
          this.authService.setLiga(liga);
        }
        return true; // ✅ Siempre dejamos entrar al componente
      }),
      catchError(err => {
        console.error('❌ Error al cargar liga:', err);
        return of(true); // ✅ También dejamos entrar aunque haya error, se mostrará vista sin liga
      })
    );
  }

}
