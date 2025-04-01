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

  constructor(
    private authService: AuthService,
    private ligasService: LigasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      // Verificar si ya tiene liga
      const ligaId = this.authService.getLigaId();

      if (ligaId) {
        console.log('✅ Liga encontrada en AuthService:', ligaId);
        return; // ya la tenía cargada, no hacemos nada
      }

      console.log('ℹ️ No hay liga en memoria, buscando desde el backend...');
      this.ligasService.obtenerLigaDelUsuario(user.id).subscribe({
        next: (id) => {
          if (id) {
            console.log('✅ Liga encontrada en el backend:', id);
            this.authService.setLigaId(id);
            this.router.navigate(['/mercado']); // redirigir a zona de juego
          } else {
            this.router.navigate(['/ligas']); // si no está en liga, va a crear/unirse
          }
        },
        error: () => {
          console.log('❌ Error verificando liga');
          this.router.navigate(['/ligas']);
        }
      });
    }
  }
}
