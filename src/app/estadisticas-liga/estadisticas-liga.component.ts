import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EstadisticasService } from '../../app/services/estadisticas.service';
import { OfertasService } from '../../app/services/ofertas.service';
import { UsuarioService } from '../../app/services/usuario.service';
import { Jugador } from '../../app/models/jugador.model';
import { Oferta } from '../../app/models/oferta.model';
import { AuthService } from '../services/auth.service';
import { ChartData, ChartOptions, Chart } from 'chart.js';

@Component({
  selector: 'app-estadisticas-liga',
  templateUrl: './estadisticas-liga.component.html',
  styleUrls: ['./estadisticas-liga.component.css']
})
export class EstadisticasLigaComponent implements OnInit {
  jugadores: Jugador[] = [];
  usuarioId: number = 0;
  usuarioDinero: number = 0;
  totalOfertasEnCurso: number = 0;
  ofertasEnCurso: { [jugadorId: number]: number } = {};

  mostrarDialogo: boolean = false;
  jugadorSeleccionado?: Jugador;
  mensajeError: string = '';

  radarTopData: ChartData<'radar'> = { labels: [], datasets: [] };
  radarTopOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#0f172a' } },
      title: { display: true, text: '📡 Comparativa Top Jugadores', color: '#2563eb' }
    },
    scales: {
      r: {
        pointLabels: { color: '#1f2937' },
        ticks: { color: '#6b7280' },
        grid: { color: 'rgba(0,0,0,0.1)' }
      }
    }
  };

  constructor(
    private estadisticasService: EstadisticasService,
    private ofertasService: OfertasService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user?.id) {
      console.error("❌ No se encontró el usuario autenticado.");
      return;
    }

    this.usuarioId = user.id;

    // Dinero y ofertas se cargan una vez
    this.obtenerDineroUsuario();
    this.cargarOfertasUsuario();

    // 🔄 Suscribirse a cambios de ligaId para actualizar estadísticas dinámicamente
    this.authService.getLigaObservable().subscribe(ligaId => {
      if (ligaId) {
        this.cargarEstadisticas();
        this.construirRadarJugadoresTop(); // ✅ Generar radar dinámico

        this.cdr.detectChanges(); // fuerza actualización visual
      }
    });
  }

  cargarEstadisticas(): void {
    const ligaId = this.authService.getLigaId();

    if (!ligaId) {
      console.warn("⚠ No se pudo cargar estadísticas: no hay ligaId.");
      return;
    }

    this.estadisticasService.getJugadoresDeLiga(ligaId).subscribe({
      next: (data: Jugador[]) => {
        this.jugadores = data.map((jugador: Jugador) => ({
          ...jugador,
          propietarioId: jugador.propietarioId ?? 0,
          propietarioUsername: jugador.propietarioUsername ?? 'Libre'
        }));
        console.log("📊 Jugadores con estadísticas cargados:", this.jugadores);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error("❌ Error obteniendo las estadísticas:", error);
      }
    });
  }

  obtenerDineroUsuario(): void {
    this.authService.usuarioCompleto$.subscribe(usuario => {
      this.usuarioDinero = usuario?.dinero ?? 0;
      this.cdr.detectChanges();
    }, error => {
      console.error("❌ Error al obtener el dinero del usuario", error);
    });
  }

  cargarOfertasUsuario(): void {
    const ligaId = this.authService.getLigaId();
    if (!ligaId) {
      console.warn("⚠ No se pudo cargar ofertas: no hay liga activa.");
      return;
    }

    this.ofertasService.obtenerOfertasPorComprador(this.usuarioId, ligaId).subscribe(ofertas => {
      this.ofertasEnCurso = {}; // ✅ limpiar completamenteºººº
      this.totalOfertasEnCurso = 0;

      ofertas.forEach(oferta => {
        if (oferta.estado === 'PENDIENTE' && oferta.jugador?.id !== undefined && oferta.id !== undefined) {
          this.ofertasEnCurso[oferta.jugador.id] = oferta.id;
          this.totalOfertasEnCurso += oferta.montoOferta ?? 0;
        }
      });

      this.cdr.detectChanges();
    }, error => {
      console.error("❌ Error al obtener ofertas en curso", error);
    });
  }

  abrirDialogoOferta(jugador: Jugador): void {
    this.jugadorSeleccionado = jugador;
    this.mostrarDialogo = true;
    this.mensajeError = '';
    this.cdr.detectChanges();
  }

  cerrarDialogoOferta(): void {
    this.mostrarDialogo = false;
    this.mensajeError = '';
    this.cdr.detectChanges();
  }

  enviarOferta(event: { monto: number }): void {
    if (!this.jugadorSeleccionado || (this.jugadorSeleccionado.propietarioId ?? 0) === 0) {
      console.error("❌ No se puede enviar una oferta a un jugador sin propietario.");
      return;
    }

    const totalPropuesto = this.totalOfertasEnCurso + event.monto;
    if (totalPropuesto > this.usuarioDinero) {
      this.mensajeError = `❌ Tus ofertas totales (${totalPropuesto} €) superan tu dinero disponible (${this.usuarioDinero} €).`;
      this.cdr.detectChanges();
      return;
    }

    const ligaId = this.authService.getLigaId();
    if (!ligaId) {
      console.error("❌ No se pudo enviar la oferta: no hay liga activa.");
      return;
    }

    const nuevaOferta: Oferta = {
      jugador: this.jugadorSeleccionado,
      comprador: { id: this.usuarioId },
      vendedor: { id: this.jugadorSeleccionado.propietarioId ?? 0 },
      montoOferta: event.monto,
      estado: 'PENDIENTE',
      liga: { id: ligaId }
    };

    this.ofertasService.crearOferta(nuevaOferta).subscribe(() => {
      if (this.jugadorSeleccionado?.id !== undefined) {
        const jugadorId = this.jugadorSeleccionado.id;

        this.ofertasEnCurso[jugadorId] = -1; // Marcamos visualmente
        this.cdr.detectChanges();

        // Esperamos al backend para recuperar ID real
        this.ofertasService.obtenerUltimaOferta(this.usuarioId, jugadorId, ligaId).subscribe({
          next: (oferta) => {
            if (oferta?.id) {
              this.ofertasEnCurso[jugadorId] = oferta.id;
              this.cdr.detectChanges();
            }
          }
        });
      }

      this.cerrarDialogoOferta();
      this.authService.refreshUsuarioCompleto();
      this.cargarOfertasUsuario(); // <- AÑADIDO CLAVE
    }, error => {
      this.mensajeError = "❌ Error al enviar la oferta. Inténtalo nuevamente.";
      this.cdr.detectChanges();
    });
  }

  cancelarOferta(jugadorId: number): void {
    const ofertaId = this.ofertasEnCurso[jugadorId] ?? 0;
    if (!ofertaId) return;

    delete this.ofertasEnCurso[jugadorId];
    this.cdr.detectChanges();

    this.ofertasService.retirarOferta(ofertaId).subscribe(() => {
      this.obtenerDineroUsuario();
      this.authService.refreshUsuarioCompleto();
      this.cargarOfertasUsuario(); // <- AÑADIDO CLAVE
    }, error => {
      console.error("❌ Error al cancelar la oferta:", error);
      this.ofertasEnCurso[jugadorId] = ofertaId; // Restauramos si falló
      this.cdr.detectChanges();
    });
  }

  // Método para construir el gráfico radar con los 3 mejores jugadores
  construirRadarJugadoresTop(): void {
    const topJugadores = this.jugadores
      .filter(j => j.fp && j.min && j.t3) // asegurarse de que haya datos
      .sort((a, b) => (b.fp ?? 0) - (a.fp ?? 0))
      .slice(0, 3); // top 3 por FP

    this.radarTopData = {
      labels: ['TL', 'T2', 'T3', 'Min', 'FP'],
      datasets: topJugadores.map(j => ({
        label: j.nombre,
        data: [
          j.tl ?? 0,
          j.t2 ?? 0,
          j.t3 ?? 0,
          j.min ?? 0,
          j.fp ?? 0
        ],
        fill: true,
        borderColor: this.getColor(j.nombre),
        backgroundColor: this.getColor(j.nombre, 0.2),
        pointBackgroundColor: this.getColor(j.nombre)
      }))
    };

    this.createRadarChart();
  }

  createRadarChart() {
    const ctx = document.getElementById('radarChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'radar',
      data: this.radarTopData,
      options: this.radarTopOptions
    });
  }

  getColor(nombre: string, alpha: number = 1): string {
    const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const index = nombre.length % colores.length;
    const color = colores[index];
    return alpha === 1 ? color : color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
  }
}
