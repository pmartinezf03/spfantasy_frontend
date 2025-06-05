import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LigasService } from './services/ligas.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'sp_fantasy';
  mostrarInteliArtif = false; //  NUEVO

  constructor(
    private authService: AuthService,
    private ligasService: LigasService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.authService.initSesionDesdeStorage();

    //  Observamos si hay sesión activa para mostrar <app-inteli-artif>
    this.authService.isAuthenticated$.subscribe((autenticado) => {
      this.mostrarInteliArtif = autenticado;
    });

    setTimeout(() => {
      const user = this.authService.getUser();
      if (user) {
        const ligaId = this.authService.getLigaId();

        if (ligaId) {
          return;
        }

        this.ligasService.obtenerLigaDelUsuario(user.id).subscribe({
          next: (liga) => {
            if (liga) {
              this.authService.setLigaId(liga.id);
              this.authService.setLiga(liga);
              this.router.navigate(['/mercado']);
            } else {
              this.router.navigate(['/ligas']);
            }
          },
          error: () => {
            this.router.navigate(['/ligas']);
          }
        });
      }
    }, 300);
  }
}
