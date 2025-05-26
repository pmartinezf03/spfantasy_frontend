import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { JugadorService } from '../../services/jugador.service';
import { Jugador } from '../../models/jugador.model';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { TutorialService } from '../../services/tutorial.service';

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
  tutorialVisto = false;

  constructor(
    private authService: AuthService,
    private jugadorService: JugadorService,
    private cdr: ChangeDetectorRef,
    private usuarioService: UsuarioService,
    private tutorialService: TutorialService
  ) { }

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();
    if (!usuario?.id) return;

    this.usuarioService.obtenerUsuarioCompleto(usuario.id).subscribe(usuario => {
      this.usuario = usuario;

      // Solo si el usuario ha SALTADO explícitamente el tutorial (globalmente), no lo mostramos más
      this.tutorialVisto = localStorage.getItem('tutorial_comparador') === 'true'
        || localStorage.getItem('tutorial_global') === 'true'
        || usuario.tutorialVisto === true;

      this.cdr.detectChanges();

      if (!this.tutorialVisto) {
        this.tutorialService.lanzarTutorialManual(usuario, 'tutorial_comparador', [
          { element: '#paso-selector', intro: 'Selecciona dos jugadores para compararlos' },
          { element: '#paso-boton', intro: 'Haz clic en "Comparar" para continuar.' },
          { element: '#paso-cromos', intro: 'Estas cartas muestran las estadísticas comparadas de cada jugador' },
          { element: '#paso-grafico', intro: 'Gráfico comparativo entre ambos jugadores' }
        ]);
      }

      const ligaId = this.authService.getLigaId();
      if (ligaId) {
        this.jugadorService.obtenerJugadoresPorLiga(ligaId).subscribe(jugadores => {
          this.jugadores = jugadores;
          this.cdr.detectChanges();
        });
      }
    });

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#facc15', // Amarillo NBA
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        }
      },
      scales: {
        r: {
          angleLines: {
            color: '#334155' // líneas radiales suaves
          },
          grid: {
            color: '#475569' // líneas circulares
          },
          pointLabels: {
            color: '#93c5fd', // etiquetas (Pts, Min...) celestes
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            color: '#f1f5f9',
            backdropColor: 'transparent',
            font: {
              size: 12
            }
          }
        }
      }
    };

  }


  comparar(): void {
    if (this.jugador1 && this.jugador2) {
      this.mostrarComparacion = true;
      this.updateChart();

      if (!this.tutorialVisto) {
        setTimeout(() => {
          this.tutorialService.manualNextStep();
        }, 500);
      }
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

  saltarTutorial(): void {
    if (this.usuario) {
      this.tutorialService.finalizarTutorial(this.usuario.id, 'tutorial_comparador');
      this.tutorialVisto = true;
    }
  }

  get jugadoresParaJugador1(): Jugador[] {
    return this.jugadores.filter(j => j !== this.jugador2);
  }

  get jugadoresParaJugador2(): Jugador[] {
    return this.jugadores.filter(j => j !== this.jugador1);
  }




}
