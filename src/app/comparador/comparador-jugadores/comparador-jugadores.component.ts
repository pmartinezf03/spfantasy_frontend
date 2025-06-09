  import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
  import { AuthService } from '../../services/auth.service';
  import { JugadorService } from '../../services/jugador.service';
  import { Jugador } from '../../models/jugador.model';
  import { UsuarioService } from '../../services/usuario.service';
  import { Usuario } from '../../models/usuario.model';
  import 'shepherd.js/dist/css/shepherd.css';
  import { TutorialService } from '../../services/tutorial.service';

  @Component({
    selector: 'app-comparador-jugadores',
    templateUrl: './comparador-jugadores.component.html',
    styleUrls: ['./comparador-jugadores.component.css'],
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
      private usuarioService: UsuarioService,
      private tutorialService: TutorialService
    ) { }

    ngOnInit(): void {
      const usuario = this.authService.getUsuario();
      if (!usuario?.id) return;

      this.usuarioService.obtenerUsuarioCompleto(usuario.id).subscribe(usuario => {
        this.usuario = usuario;

        this.cdr.detectChanges();

        this.tutorialService.lanzarTutorial(
          usuario,
          'tutorial_comparador',
          [
            {
              id: 'paso-selector',
              title: 'Paso 1: Selección',
              text: 'Selecciona dos jugadores para compararlos.',
              attachTo: { element: '#paso-selector', on: 'bottom' }
            },
            {
              id: 'paso-boton',
              title: 'Paso 2: Comparar',
              text: 'Haz clic en "Comparar" para generar la visualización.',
              attachTo: { element: '#paso-boton', on: 'bottom' }
            },
            {
              id: 'paso-cromos',
              title: 'Paso 3: Estadísticas',
              text: 'Aquí se muestran las estadísticas comparadas como cromos.',
              attachTo: { element: '#paso-cromos', on: 'bottom' }
            },
            {
              id: 'paso-grafico',
              title: 'Paso 4: Gráfico',
              text: 'Gráfico interactivo con los valores comparados.',
              attachTo: { element: '#paso-grafico', on: 'top' }
            }
          ]
        );


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
              color: '#facc15',
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          }
        },
        scales: {
          r: {
            angleLines: { color: '#334155' },
            grid: { color: '#475569' },
            pointLabels: {
              color: '#93c5fd',
              font: { size: 14, weight: 'bold' }
            },
            ticks: {
              color: '#f1f5f9',
              backdropColor: 'transparent',
              font: { size: 12 }
            }
          }
        }
      };
    }




    verificarPaso1(): void {
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
    comparar(): void {
      if (this.jugador1 && this.jugador2) {
        this.mostrarComparacion = true;
        this.updateChart();
      }
    }



    get jugadoresParaJugador1(): Jugador[] {
      return this.jugadores.filter(j => j !== this.jugador2);
    }

    get jugadoresParaJugador2(): Jugador[] {
      return this.jugadores.filter(j => j !== this.jugador1);
    }
  }
