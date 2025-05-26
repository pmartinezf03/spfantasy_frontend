import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { JugadorService } from '../../services/jugador.service';
import { Jugador } from '../../models/jugador.model';
import introJs from 'intro.js';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-comparador-jugadores',
  templateUrl: './comparador-jugadores.component.html',
  styleUrls: ['./comparador-jugadores.component.css']
})
export class ComparadorJugadoresComponent implements OnInit {
  jugadores: Jugador[] = [];

  jugador1: Jugador | null = null;
  jugador2: Jugador | null = null;

  expandChart = false;
  mostrarComparacion = false;

  chartData: any;
  chartOptions: any;

  usuario!: Usuario;

  constructor(
    private authService: AuthService,
    private jugadorService: JugadorService,
    private cdr: ChangeDetectorRef,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    const usuario = this.authService.getUsuario(); // Asegúrate de que devuelva el usuario con ID

    if (!usuario?.id) {
      console.error('❌ No se pudo obtener el ID del usuario.');
      return;
    }

    // 1. Cargar datos del usuario
    this.usuarioService.obtenerUsuarioCompleto(usuario.id).subscribe(usuario => {
      this.usuario = usuario;

      const ligaId = this.authService.getLigaId();

      if (ligaId) {
        this.jugadorService.obtenerJugadoresPorLiga(ligaId).subscribe(jugadores => {
          this.jugadores = jugadores;

          // 2. Mostrar tutorial si no está marcado en localStorage y no lo ha visto aún
          if (!localStorage.getItem('tutorial_comparador') && !usuario.tutorialVisto) {
            this.lanzarTutorial();
            localStorage.setItem('tutorial_comparador', 'true');
          }
        });
      }
    });

    // 3. Configuración de gráfico
    this.chartOptions = {
      plugins: {
        legend: { labels: { color: '#ffffff' } }
      },
      scales: {
        r: {
          angleLines: { color: '#888' },
          grid: { color: '#444' },
          pointLabels: { color: '#fff' },
          ticks: { color: '#fff' }
        }
      }
    };
  }


  comparar(): void {
    if (this.jugador1 && this.jugador2) {
      console.log('Jugador 1:', this.jugador1);
      console.log('Jugador 2:', this.jugador2);
      this.mostrarComparacion = true;
      this.updateChart();
    } else {
      console.warn('❌ Debes seleccionar dos jugadores');
    }
  }

  updateChart(): void {
    this.chartData = {
      labels: ['Pts', 'Min', 'Tiro total', 'Valor'],
      datasets: [
        {
          label: this.jugador1?.nombre,
          data: [
            this.jugador1?.pts ?? 0,
            this.jugador1?.min ?? 0,
            (this.jugador1?.t2 ?? 0) + (this.jugador1?.t3 ?? 0) + (this.jugador1?.tl ?? 0),
            (this.jugador1?.precioVenta ?? 0) / 100000
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.4)',
          borderColor: 'rgba(255, 99, 132, 1)'
        },
        {
          label: this.jugador2?.nombre,
          data: [
            this.jugador2?.pts ?? 0,
            this.jugador2?.min ?? 0,
            (this.jugador2?.t2 ?? 0) + (this.jugador2?.t3 ?? 0) + (this.jugador2?.tl ?? 0),
            (this.jugador2?.precioVenta ?? 0) / 100000
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.4)',
          borderColor: 'rgba(54, 162, 235, 1)'
        }
      ]
    };
  }

  lanzarTutorial(): void {
    const intro = introJs();
    intro.setOptions({
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      skipLabel: 'Saltar',
      doneLabel: '¡Entendido!',
      hidePrev: false,
      hideNext: false,
      showProgress: true,
      showBullets: false
    });

    intro.oncomplete(() => {
      if (this.usuario && !this.usuario.tutorialVisto) {
        this.usuarioService.marcarTutorialVisto(this.usuario.id).subscribe(() => {
          this.usuario.tutorialVisto = true;
        });
      }
    });

    intro.start();
  }


}
