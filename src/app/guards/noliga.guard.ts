import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { CanActivate, Router } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class NoLigaGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const ligaId = this.auth.getLigaId();
    if (ligaId) {
      this.router.navigate(['/plantilla']);
      return false;
    }
    return true;
  }
}
