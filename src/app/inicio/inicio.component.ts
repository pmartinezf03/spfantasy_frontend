import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';  // Importa ChartType
import { AuthService } from '../services/auth.service';
import { NoticiasService } from '../services/noticias.service';
import { EstadisticasService } from '../services/estadisticas.service';
import { Jugador } from '../models/jugador.model';
import { Noticia } from '../models/noticia.model';
import { Usuario } from '../models/usuario.model';
import { HttpClient } from '@angular/common/http';
import { TutorialService } from '../services/tutorial.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

  usuario: Usuario | null = null;
  ligaId: number | null = null;

  ranking: any[] = [];
  noticias: Noticia[] = [];
  tutorialVisto = false;

  topT3: Jugador[] = [];
  topFp: Jugador[] = [];
  topRendimiento: Jugador[] = [];
  topPrecio: Jugador[] = [];
  topMinutos: Jugador[] = [];
  topTl: Jugador[] = [];
  chartT3: ChartData<'bar'> = { labels: [], datasets: [] };
  showCongratsModal: boolean = false; // Estado para el modal
  congratsMessage: string = ''; // Mensaje de felicitación
  comparativa: { usuarioPuntos: number, mediaLiga: number } = { usuarioPuntos: 0, mediaLiga: 0 };

  chartData: ChartData<'bar'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Comparativa: Tú vs Liga', color: '#facc15' }
    },
    scales: {
      x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
  };

  chartMinutos: ChartData<'bar'> = { labels: [], datasets: [] };
  chartRendimiento: ChartData<'line'> = { labels: [], datasets: [] };
  chartPrecio: ChartData<'bar'> = { labels: [], datasets: [] };
  chartPuntos: ChartData<'bar'> = { labels: [], datasets: [] };

  radarData: ChartData<'radar'> = {
    labels: ['T2', 'T3', 'TL', 'Minutos', 'FP'],
    datasets: []
  };

  radarOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#f9fafb' } },
      title: { display: true, text: 'Estadísticas globales', color: '#facc15' }
    },
    scales: {
      r: {
        pointLabels: { color: '#f3f4f6' },
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#e5e7eb', backdropColor: 'transparent' }
      }
    }
  };

  doughnutData: ChartData<'doughnut'> = {
    labels: ['Triples', 'Tiros Libres', 'Minutos'],
    datasets: []
  };

  doughnutOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#f9fafb' } }
    }
  };

  carruselTop: any[] = [];

  chartsResumen: {
    titulo: string,
    label: string,
    tipo: 'bar' | 'line',
    data: ChartData<'bar'> | ChartData<'line'>,
    options: ChartOptions
  }[] = [];

  // Modal state
  isModalOpen: boolean = false;
  selectedChartData: any = null;
  selectedChartType: ChartType = 'bar';
  selectedChartOptions: any = null;

  constructor(
    private authService: AuthService,
    private estadisticasService: EstadisticasService,
    private http: HttpClient,
    private tutorialService: TutorialService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.authService.usuarioCompleto$.subscribe(usuario => {
      this.usuario = usuario;
      if (usuario) {
        this.tutorialVisto = localStorage.getItem('tutorial_inicio') === 'true'
          || localStorage.getItem('tutorial_global') === 'true'
          || usuario.tutorialVisto === true;
        this.cdr.detectChanges();


      }


      if (usuario) {
        const rachaActual = usuario.rachaLogin ?? 0;

        if (rachaActual >= 2 && !usuario.rachasFelicitadas?.includes(rachaActual)) {
          this.congratsMessage = `🎉 ¡Felicidades ${usuario.username}! Has iniciado sesión durante ${rachaActual} día/s consecutivos. ¡Sigue así!`;
          this.showCongratsModal = true;

          // Llamada al backend para registrar la racha como felicitada
          this.http.post(`/api/usuarios/${usuario.id}/racha-felicitada?racha=${rachaActual}`, {}).subscribe({
            next: () => {
              console.log('✅ Racha registrada correctamente en backend');
              usuario.rachasFelicitadas = [...(usuario.rachasFelicitadas ?? []), rachaActual];
            },
            error: err => {
              console.warn('⚠️ No se pudo registrar la racha (puede que ya esté registrada):', err);
            }
          });
        }
      }

    });

    this.authService.getLigaObservable().subscribe(ligaId => {
      const usuarioId = this.authService.getUserId();
      if (ligaId && usuarioId) {
        this.ligaId = ligaId;
        this.cargarDatos(ligaId, usuarioId);
      }
    });
  }





  cargarDatos(ligaId: number, usuarioId: number): void {
    this.estadisticasService.getRanking(ligaId).subscribe(data => this.ranking = data.slice(0, 5));
    this.estadisticasService.getTopT3(ligaId).subscribe(data => this.topT3 = data);

    this.estadisticasService.getTopFp(ligaId).subscribe(data => {
      this.topFp = data;
      this.chartPuntos = {
        labels: data.map(j => j.nombre),
        datasets: [{
          label: 'Puntos FP',
          data: data.map(j => j.fp),
          backgroundColor: '#4ade80',
          borderColor: '#10b981',
          borderWidth: 2
        }]
      };
    });

    this.estadisticasService.getTopRendimiento(ligaId).subscribe(data => {
      this.topRendimiento = data;
      this.chartRendimiento = {
        labels: data.map(j => j.nombre),
        datasets: [{
          label: 'FP / Min',
          data: data.map(j => j.fp / (j.min || 1)),
          backgroundColor: '#facc15',
          borderColor: '#fbbf24',
          borderWidth: 2,
          tension: 0.4,
          fill: false
        }]
      };
    });

    this.estadisticasService.getTopPrecio(ligaId).subscribe(data => {
      this.topPrecio = data;
      this.chartPrecio = {
        labels: data.map(j => j.nombre),
        datasets: [{
          label: 'Valor €',
          data: data.map(j => j.precioVenta),
          backgroundColor: '#60a5fa',
          borderColor: '#3b82f6',
          borderWidth: 2
        }]
      };
    });

    this.estadisticasService.getTopMinutos(ligaId).subscribe(data => {
      this.topMinutos = data;
      this.actualizarGraficosSecundarios();

      this.chartMinutos = {
        labels: data.map(j => j.nombre),
        datasets: [{
          label: 'Minutos',
          data: data.map(j => j.min),
          backgroundColor: '#34d399',
          borderColor: '#10b981',
          borderWidth: 2
        }]
      };
    });

    this.estadisticasService.getTopTl(ligaId).subscribe(data => this.topTl = data);

    this.estadisticasService.getComparativa(ligaId, usuarioId).subscribe(data => {
      this.comparativa = data;
      this.actualizarGraficosSecundarios();
      this.chartData = {
        labels: ['Tu plantilla', 'Media de la liga'],
        datasets: [{
          label: 'Puntos Fantasy',
          data: [data.usuarioPuntos, data.mediaLiga],
          backgroundColor: ['#38bdf8', '#f472b6'],
          borderColor: ['#0ea5e9', '#ec4899'],
          borderWidth: 2
        }]
      };

      this.radarData.datasets = [{
        label: 'Tu plantilla',
        data: [10, 8, 7, 15, data.usuarioPuntos],
        backgroundColor: 'rgba(59,130,246,0.2)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#3b82f6'
      }];
      this.actualizarGraficosSecundarios();

    });

    // ✅ Obtener noticias desde NewsAPI en lugar de base de datos
    const apiKey = '68d8835c43cc4323b29494c947a03473';
    const url = `https://newsapi.org/v2/everything?q=baloncesto&language=es&sortBy=publishedAt&pageSize=3&apiKey=${apiKey}`;

    this.http.get<any>(url).subscribe(response => {
      this.noticias = response.articles.map((noticia: any) => ({
        titulo: noticia.title,
        contenido: noticia.description,
        imagenUrl: noticia.urlToImage
      }));
    });

    // Carrusel
    setTimeout(() => {
      this.carruselTop = [
        { titulo: '🔥 Triplistas Letales', jugadores: this.topT3, formato: (j: Jugador) => `${j.t3} triples` },
        { titulo: '💪 Rendimiento Total', jugadores: this.topRendimiento, formato: (j: Jugador) => `${j.fp} fp / ${j.min} min` },
        { titulo: '💰 Valor de Mercado', jugadores: this.topPrecio, formato: (j: Jugador) => `${j.precioVenta.toLocaleString()} €` },
        { titulo: '⏱️ Jugadores más utilizados', jugadores: this.topMinutos, formato: (j: Jugador) => `${j.min} minutos` },
        { titulo: '🏀 Tiros libres dominados', jugadores: this.topTl, formato: (j: Jugador) => `${j.tl} TL` }
      ].filter(grupo => grupo.jugadores.length > 0);
    }, 500);

    // Gráfico doughnut
    this.doughnutData = {
      labels: ['Triples', 'Tiros Libres', 'Minutos'],
      datasets: [{
        data: [this.topT3.length, this.topTl.length, this.topMinutos.length],
        backgroundColor: ['#4ade80', '#fb923c', '#3b82f6'],
        borderColor: ['#16a34a', '#f97316', '#2563eb'],
        borderWidth: 2,
        label: 'Distribución'
      }]
    };

    // Charts resumen
    this.estadisticasService.getTopT3(ligaId).subscribe(data => {
      this.topT3 = data;
      this.actualizarGraficosSecundarios();
      this.chartT3 = {
        labels: data.map(j => j.nombre),
        datasets: [{
          label: 'Triples Anotados',
          data: data.map(j => j.t3),
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 2
        }]
      };

      this.chartsResumen = [
        { titulo: '🔥 Triplistas', data: this.chartT3, label: 'Triples Anotados', tipo: 'bar', options: this.chartOptions },
        { titulo: '⏱️ Minutos Jugados', data: this.chartMinutos, label: 'Minutos', tipo: 'bar', options: this.chartOptions },
        { titulo: '⚡ Rendimiento FP/min', data: this.chartRendimiento, label: 'FP / Min', tipo: 'line', options: this.chartOptions },
        { titulo: '💰 Valor de Mercado', data: this.chartPrecio, label: 'Valor €', tipo: 'bar', options: this.chartOptions },
        { titulo: '🎯 Puntos Fantasy', data: this.chartPuntos, label: 'Puntos FP', tipo: 'bar', options: this.chartOptions }
      ];
      setTimeout(() => {
        this.actualizarGraficosSecundarios();
      }, 500);

    });
  }

  private actualizarGraficosSecundarios(): void {
    // Asignar doughnut solo si ya hay datos
    if (this.topT3.length && this.topTl.length && this.topMinutos.length) {
      this.doughnutData = {
        labels: ['Triples', 'Tiros Libres', 'Minutos'],
        datasets: [{
          data: [this.topT3.length, this.topTl.length, this.topMinutos.length],
          backgroundColor: ['#4ade80', '#fb923c', '#3b82f6'],
          borderColor: ['#16a34a', '#f97316', '#2563eb'],
          borderWidth: 2,
          label: 'Distribución'
        }]
      };
    }

    // Asignar radar solo si ya tienes datos comparativos
    if (this.comparativa && this.comparativa.usuarioPuntos) {
      this.radarData = {
        labels: ['T2', 'T3', 'TL', 'Minutos', 'FP'],
        datasets: [{
          label: 'Tu plantilla',
          data: [10, 8, 7, 15, this.comparativa.usuarioPuntos],
          backgroundColor: 'rgba(59,130,246,0.2)',
          borderColor: '#3b82f6',
          pointBackgroundColor: '#3b82f6'
        }]
      };
    }
  }



  // Modal open/close
  openModal(chartData: any, chartType: ChartType, chartOptions: any) {
    this.selectedChartData = chartData;
    this.selectedChartType = chartType;
    this.selectedChartOptions = chartOptions;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedChartData = null;
    this.selectedChartType = 'bar';
    this.selectedChartOptions = null;
  }

  saltarTutorial(): void {
    if (this.usuario) {
      this.tutorialService.finalizarTutorial(this.usuario.id, 'tutorial_comparador');
      this.tutorialVisto = true;
    }
  }



}
