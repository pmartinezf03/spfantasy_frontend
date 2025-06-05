import { Component, OnInit } from '@angular/core';
import { JugadorService } from '../services/jugador.service';
import { AuthService } from '../services/auth.service';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Jugador } from '../models/jugador.model';

@Component({
  selector: 'app-scouting',
  templateUrl: './scouting.component.html',
  styleUrls: ['./scouting.component.css'],
  providers: [DialogService, MessageService]
})
export class ScoutingComponent implements OnInit {

  jugadoresScouting: Jugador[] = [];
  cargando = true;
  jugadorSeleccionado: Jugador | null = null;
  esVip = false;
  modalVisible = false;
  mensajeRecomendacion: string = '';
  comparacionMedia: string = '';

  constructor(
    private jugadorService: JugadorService,
    private authService: AuthService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    const ligaId = this.authService.getLigaId();
    this.esVip = this.authService.esVip();

    if (ligaId) {
      this.jugadorService.obtenerJugadoresDestacados(ligaId).subscribe({
        next: (data) => {
          this.jugadoresScouting = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error('❌ Error cargando jugadores destacados:', err);
          this.cargando = false;
        }
      });
    } else {
      console.warn('️ No se encontró una liga activa.');
      this.cargando = false;
    }
  }

  mostrarDetalles(jugador: Jugador): void {
    this.jugadorSeleccionado = jugador;
    this.mensajeRecomendacion = this.generarRecomendacion(jugador);

    this.jugadorService.getMediasPorPosicion(jugador.posicion).subscribe({
      next: (medias) => {
        this.comparacionMedia = this.generarComparativa(jugador, medias);
        this.modalVisible = true;
      },
      error: (err) => {
        console.error('❌ Error al cargar medias por posición', err);
        this.comparacionMedia = '️ No se pudo cargar la comparativa.';
        this.modalVisible = true;
      }
    });
  }

  generarComparativa(jugador: Jugador, media: any): string {
    const diferencias = [
      jugador.fp > media.fp ? '✔️ FP superior a la media' : '❌ FP por debajo',
      jugador.min > media.min ? '✔️ Juega más minutos' : '⏱️ Pocos minutos',
      jugador.t2 > media.t2 ? '✔️ Buen porcentaje en T2' : '️ T2 bajo',
      jugador.t3 > media.t3 ? '✔️ Triplista eficaz' : '❌ Triples mejorables'
    ];

    return diferencias.join(' · ');
  }



  cerrarModal(): void {
    this.modalVisible = false;
    this.jugadorSeleccionado = null;
  }

  mostrarMensajeNoVip(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Solo VIPs',
      detail: 'Las estadísticas avanzadas están disponibles solo para usuarios VIP.'
    });
  }

  generarRecomendacion(jugador: Jugador): string {
    const etiquetas: string[] = [];

    if (jugador.fp && jugador.fp > 15) etiquetas.push(' Valor alto');
    if (jugador.t2 && jugador.t2 > 60) etiquetas.push(' Eficiencia en T2');
    if (jugador.rendimiento && jugador.rendimiento > 8) etiquetas.push(' En racha');
    if (jugador.precioVenta < 2000000) etiquetas.push(' Precio bajo para su nivel');

    return etiquetas.length
      ? `✅ Motivos para ficharlo: ${etiquetas.join(', ')}.`
      : '️ Jugador con rendimiento estable. Aún sin señales destacadas.';
  }

  obtenerComparativaReal(jugador: Jugador): void {
    this.jugadorService.obtenerMediaPorPosicion(jugador.posicion).subscribe({
      next: (media) => {
        const diferencias = [
          jugador.fp > media.fp ? '✔️ FP superior a la media' : '❌ FP por debajo de la media',
          jugador.min > media.min ? '✔️ Juega muchos minutos' : '⏱️ Rotación limitada',
          jugador.t2 > media.t2 ? '✔️ T2 efectivo' : '️ Mal en tiros de 2',
          jugador.t3 > media.t3 ? '✔️ Buen triplista' : '❌ Baja efectividad en T3'
        ];

        this.comparacionMedia = diferencias.join(' · ');
      },
      error: err => {
        console.error("❌ Error al obtener media por posición:", err);
        this.comparacionMedia = '❌ No se pudo obtener la comparativa.';
      }
    });
  }
}
