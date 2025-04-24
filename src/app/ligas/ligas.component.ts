import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActividadLiga, LigasService, MiembroLiga } from '../services/ligas.service';
import { Router } from '@angular/router';
import { Liga } from '../models/liga.model';

@Component({
  selector: 'app-ligas',
  templateUrl: './ligas.component.html',
  styleUrls: ['./ligas.component.css']
})
export class LigasComponent implements OnInit {

  usuarioId: number | null = null;
  ligaActual: Liga | null = null;
  miembros: MiembroLiga[] = [];
  mostrarCrearLiga = false;
  mostrarUnirseLiga = false;
  esCreador = false;
  ligaIniciada = false;
  usuario: any = null;
  actividadReciente: ActividadLiga[] = [];

  constructor(
    public authService: AuthService,
    private ligasService: LigasService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
  
    if (user && user.id) {
      this.usuarioId = user.id;
  
      this.ligasService.obtenerLigaDelUsuario(this.usuarioId).subscribe({
        next: (liga) => {
          if (liga && liga.id) {
            this.authService.setLigaId(liga.id);
            this.authService.setLiga(liga);
  
            this.ligaActual = liga;
            this.ligaIniciada = liga.iniciada;
            this.esCreador = liga.creadorId === this.usuarioId;
  
            this.cargarMiembros();
            this.cargarActividad(liga.id);
            this.cargarRanking(); // ✅ carga el ranking real
          } else {
            this.ligaActual = null;
          }
        },
        error: () => {
          this.ligaActual = null;
        }
      });
    }
  
    // Obtener datos reactivos del usuario completo
    this.authService.usuarioCompleto$.subscribe(user => {
      this.usuario = user;
    });
  }
  

  cargarLigaDelUsuario(): void {
    if (!this.usuarioId) return;

    this.ligasService.obtenerLigaDelUsuario(this.usuarioId).subscribe({
      next: liga => {
        if (liga) {
          this.authService.setLigaId(liga.id);
          this.ligaActual = liga;
          this.ligaIniciada = liga.iniciada;
          this.esCreador = liga.creadorId === this.usuarioId;
          this.cargarMiembros();
          this.cargarActividad(liga.id); // ✅ NUEVO
        }
      },
      error: () => {
        this.ligaActual = null;
        this.authService.setLigaId(null);
      }
    });
  }

  cargarActividad(ligaId: number): void {
    this.ligasService.obtenerActividadLiga(ligaId).subscribe({
      next: (actividad) => this.actividadReciente = actividad,
      error: (err) => console.error('❌ Error al cargar actividad:', err)
    });
  }

  cargarMiembros(): void {
    if (!this.ligaActual?.id) return;

    this.ligasService.obtenerMiembros(this.ligaActual.id).subscribe({
      next: miembros => this.miembros = miembros,
      error: err => console.error('Error cargando miembros:', err)
    });
  }

  salirLiga(): void {
    const ligaId = this.ligaActual?.id;
    if (!ligaId || !this.usuarioId) return;

    this.ligasService.salirDeLiga(ligaId, this.usuarioId).subscribe({
      next: () => {
        this.ligaActual = null;
        this.miembros = [];
        this.authService.setLigaId(null);
        this.authService.setLiga(null);
        this.esCreador = false;
        this.ligaIniciada = false;
      },
      error: err => {
        console.error('❌ Error al salir de la liga:', err);
      }
    });
  }

  mostrarCrear(): void {
    this.mostrarCrearLiga = true;
    this.mostrarUnirseLiga = false;
  }

  mostrarUnirse(): void {
    this.mostrarUnirseLiga = true;
    this.mostrarCrearLiga = false;
  }

  onLigaCreada(liga: Liga): void {
    this.ligaActual = liga;
    this.authService.setLigaId(liga.id);
    this.authService.setLiga(liga);
    this.mostrarCrearLiga = false;
    this.esCreador = true;
    this.ligaIniciada = false;
    this.cargarMiembros();
    this.cargarActividad(liga.id); // ✅ NUEVO
    this.router.navigate(['/mercado']);
    this.authService.refreshUsuarioCompleto();
  }

  onUnidoALiga(liga: Liga): void {
    this.ligaActual = liga;
    this.authService.setLigaId(liga.id);
    this.authService.setLiga(liga);
    this.mostrarUnirseLiga = false;
    this.esCreador = false;
    this.ligaIniciada = false;
    this.cargarMiembros();
    this.cargarActividad(liga.id); // ✅ NUEVO
    this.router.navigate(['/mercado']);
  }

  cargarRanking(): void {
    if (!this.ligaActual?.id) return;
  
    this.ligasService.obtenerRanking(this.ligaActual.id).subscribe({
      next: ranking => {
        this.ranking = ranking;
        this.graficoPuntos = {
          labels: ranking.map(r => r.nombre),
          datasets: [
            {
              label: 'Puntos Totales',
              backgroundColor: ['#fbc02d', '#4caf50', '#2196f3', '#ff5722', '#9c27b0'],
              data: ranking.map(r => r.puntosTotales)
            }
          ]
        };
        
      },
      error: err => console.error('❌ Error al cargar ranking:', err)
    });
  }
  

  // Datos de ejemplo para el gráfico
  ranking: any[] = [];


  graficoPuntos = {
    labels: this.ranking.map(r => r.Usuario),
    datasets: [
      {
        label: 'Puntos Totales',
        backgroundColor: ['#fbc02d', '#4caf50', '#2196f3', '#ff5722', '#9c27b0'],
        data: this.ranking.map(r => r.Puntos)
      }
    ]
  };

  graficoOpciones = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#ffffff' },
        grid: { color: '#444' }
      },
      x: {
        ticks: { color: '#ffffff' },
        grid: { display: false }
      }
    }
  };
}
