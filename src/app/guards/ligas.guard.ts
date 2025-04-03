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

    const ligaId = this.authService.getLigaId();

    if (ligaId !== null && ligaId !== undefined) {
      console.log('✅ Liga encontrada en AuthService:', ligaId);
      return of(true);
    }

    console.log('ℹ️ No hay liga en memoria, buscando desde el backend...');
    return this.ligasService.obtenerLigaDelUsuario(userId).pipe(
      map(id => {
        if (id !== null && id !== undefined) {
          console.log('✅ Usuario está en una liga:', id);
          this.authService.setLigaId(id.id); // ✅ .id de la liga
          this.authService.setLiga(id);      // ✅ objeto completo
                    return true;
        } else {
          console.warn('⛔ Usuario NO pertenece a ninguna liga. Redirigiendo...');
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
