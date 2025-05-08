import { CanActivate, Router } from "@angular/router";
import { map, Observable } from "rxjs";
import { AuthService } from "../services/auth.service";
import { Injectable } from "@angular/core";
@Injectable({
  providedIn: 'root'
})
export class VipGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    console.log('🚀 [VipGuard] Ejecutando canActivate');

    return this.authService.usuarioCompleto$.pipe(
      map(usuario => {
        console.log('👤 Usuario completo recibido en VipGuard:', usuario);

        const vipHasta = usuario?.vipHasta;
        console.log('🧪 VIP hasta (guard):', vipHasta);

        if (!vipHasta) {
          console.warn('🚫 Usuario no es VIP. Redirigiendo a /inicio');
          this.router.navigate(['/inicio']);
          return false;
        }

        const expiracion = new Date(vipHasta);
        const ahora = new Date();
        const esVip = expiracion > ahora;

        console.log('🔎 VIP válido?', esVip);

        if (!esVip) {
          console.warn('🚫 Usuario no es VIP vigente. Redirigiendo a /inicio');
          this.router.navigate(['/inicio']);
          return false;
        }

        return esVip;
      })
    );
  }
}
