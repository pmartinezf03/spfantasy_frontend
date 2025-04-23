// inicio.component.ts COMPLETO Y CORREGIDO
import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { AuthService } from '../services/auth.service';
import { NoticiasService } from '../services/noticias.service';
import { EstadisticasService } from '../services/estadisticas.service';
import { Jugador } from '../models/jugador.model';
import { Noticia } from '../models/noticia.model';
import { Usuario } from '../models/usuario.model';

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

  topT3: Jugador[] = [];
  topFp: Jugador[] = [];
  topRendimiento: Jugador[] = [];
  topPrecio: Jugador[] = [];
  topMinutos: Jugador[] = [];
  topTl: Jugador[] = [];
  chartT3: ChartData<'bar'> = { labels: [], datasets: [] };

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

  constructor(
    private authService: AuthService,
    private estadisticasService: EstadisticasService,
    private noticiasService: NoticiasService
  ) {}

  ngOnInit(): void {
    this.authService.usuarioCompleto$.subscribe(usuario => {
      this.usuario = usuario;
      const liga = this.authService.getLiga();
      if (usuario?.id && liga?.id) {
        this.ligaId = liga.id;
        this.cargarDatos(liga.id, usuario.id);
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
          backgroundColor: '#6366f1'
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
          backgroundColor: '#f59e0b',
          borderColor: '#f59e0b',
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
          backgroundColor: '#3b82f6'
        }]
      };
    });

    this.estadisticasService.getTopMinutos(ligaId).subscribe(data => {
      this.topMinutos = data;
      this.chartMinutos = {
        labels: data.map(j => j.nombre),
        datasets: [{
          label: 'Minutos',
          data: data.map(j => j.min),
          backgroundColor: '#10b981'
        }]
      };
    });

    this.estadisticasService.getTopTl(ligaId).subscribe(data => this.topTl = data);

    this.estadisticasService.getComparativa(ligaId, usuarioId).subscribe(data => {
      this.comparativa = data;
      this.chartData = {
        labels: ['Tu plantilla', 'Media de la liga'],
        datasets: [{
          label: 'Puntos Fantasy',
          data: [data.usuarioPuntos, data.mediaLiga],
          backgroundColor: ['#42A5F5', '#FF6384']
        }]
      };

      this.radarData.datasets = [{
        label: 'Tu plantilla',
        data: [10, 8, 7, 15, data.usuarioPuntos],
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: '#FF6384',
        pointBackgroundColor: '#FF6384'
      }];
    });

    this.noticiasService.getNoticias().subscribe(data => {
      this.noticias = data.slice(0, 5);
    });

    setTimeout(() => {
      this.carruselTop = [
        { titulo: '🔥 Triplistas Letales', jugadores: this.topT3, formato: (j: Jugador) => `${j.t3} triples` },
        { titulo: '💪 Rendimiento Total', jugadores: this.topRendimiento, formato: (j: Jugador) => `${j.fp} fp / ${j.min} min` },
        { titulo: '💰 Valor de Mercado', jugadores: this.topPrecio, formato: (j: Jugador) => `${j.precioVenta.toLocaleString()} €` },
        { titulo: '⏱️ Jugadores más utilizados', jugadores: this.topMinutos, formato: (j: Jugador) => `${j.min} minutos` },
        { titulo: '🏀 Tiros libres dominados', jugadores: this.topTl, formato: (j: Jugador) => `${j.tl} TL` }
      ].filter(grupo => grupo.jugadores.length > 0);
    }, 500);

    this.doughnutData = {
      labels: ['Triples', 'Tiros Libres', 'Minutos'],
      datasets: [{
        data: [this.topT3.length, this.topTl.length, this.topMinutos.length],
        backgroundColor: ['#4ade80', '#fb923c', '#3b82f6'],
        label: 'Distribución'
      }]
    };

    this.estadisticasService.getTopT3(ligaId).subscribe(data => {
      this.topT3 = data;
      this.chartT3 = {
        labels: data.map(j => j.nombre),
        datasets: [{
          label: 'Triples Anotados',
          data: data.map(j => j.t3),
          backgroundColor: '#ef4444'
        }]
      };

      this.chartsResumen = [
        { titulo: '🔥 Triplistas', data: this.chartT3, label: 'Triples Anotados', tipo: 'bar', options: this.chartOptions },
        { titulo: '⏱️ Minutos Jugados', data: this.chartMinutos, label: 'Minutos', tipo: 'bar', options: this.chartOptions },
        { titulo: '⚡ Rendimiento FP/min', data: this.chartRendimiento, label: 'FP / Min', tipo: 'line', options: this.chartOptions },
        { titulo: '💰 Valor de Mercado', data: this.chartPrecio, label: 'Valor €', tipo: 'bar', options: this.chartOptions },
        { titulo: '🎯 Puntos Fantasy', data: this.chartPuntos, label: 'Puntos FP', tipo: 'bar', options: this.chartOptions }
      ];
    });
  }
}