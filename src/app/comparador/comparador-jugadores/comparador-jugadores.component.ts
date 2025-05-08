import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { JugadorService } from '../../services/jugador.service';
import { Jugador } from '../../models/jugador.model'; // ← usamos tu modelo base aquí

@Component({
  selector: 'app-comparador-jugadores',
  templateUrl: './comparador-jugadores.component.html'
})
export class ComparadorJugadoresComponent implements OnInit {
  jugadores: Jugador[] = [];

  jugador1: Jugador | null = null;
  jugador2: Jugador | null = null;

  expandChart = false;
  mostrarComparacion = false;

  chartData: any;
  chartOptions: any;

  constructor(
    private authService: AuthService,
    private jugadorService: JugadorService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const ligaId = this.authService.getLigaId();

    if (ligaId) {
      this.jugadorService.obtenerJugadoresPorLiga(ligaId).subscribe(jugadores => {
        this.jugadores = jugadores;
      });
    }

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

}
