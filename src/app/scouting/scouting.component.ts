import { Component, OnInit } from '@angular/core';
import { Jugador } from '../models/jugador.model';
import { JugadorService } from '../services/jugador.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-scouting',
  templateUrl: './scouting.component.html',
  styleUrls: ['./scouting.component.css']
})
export class ScoutingComponent implements OnInit {

  jugadoresScouting: Jugador[] = [];
  cargando = true;

  constructor(
    private jugadorService: JugadorService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const ligaId = this.authService.getLigaId();

    if (ligaId) {
      this.jugadorService.obtenerJugadoresDestacados(ligaId).subscribe({
        next: (data) => {
          this.jugadoresScouting = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error cargando jugadores destacados:', err);
          this.cargando = false;
        }
      });
    } else {
      console.warn('⚠️ No se encontró una liga activa.');
      this.cargando = false;
    }
  }
}
