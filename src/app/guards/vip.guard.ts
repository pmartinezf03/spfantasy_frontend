import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VipGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.usuarioCompleto$.pipe(
      take(1),
      map(usuario => {
        const vipHasta = usuario?.vipHasta;
        console.log('🧪 VIP hasta (guard):', vipHasta);

        if (!vipHasta) {
          console.warn('🚫 Usuario no es VIP. Redirigiendo a /vip');
          this.router.navigate(['/vip']);
          return false;
        }

        const expiracion = new Date(vipHasta);
        const ahora = new Date();
        const esVip = expiracion > ahora;

        if (!esVip) {
          console.warn('🚫 Usuario no es VIP vigente. Redirigiendo a /vip');
          this.router.navigate(['/vip']);
        }

        return esVip;
      })
    );
  }
}
