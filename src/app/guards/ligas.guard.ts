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
      this.router.navigate(['/login']);
      return of(false);
    }

    return this.ligasService.obtenerLigaDelUsuario(userId).pipe(
      map(ligaId => {
        if (ligaId) return true;
        this.router.navigate(['/ligas']);
        return false;
      }),
      catchError(err => {
        this.router.navigate(['/ligas']);
        return of(false);
      })
    );
  }

}
