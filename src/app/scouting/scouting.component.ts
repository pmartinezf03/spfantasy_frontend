import { Component, OnInit } from '@angular/core';
import { JugadorService } from '../services/jugador.service';
import { AuthService } from '../services/auth.service';
import { DialogService } from 'primeng/dynamicdialog'; // Añadido para el modal
import { MessageService } from 'primeng/api'; // Añadido para las notificaciones
import { Jugador } from '../models/jugador.model';

@Component({
  selector: 'app-scouting',
  templateUrl: './scouting.component.html',
  styleUrls: ['./scouting.component.css'],
  providers: [DialogService, MessageService] // Añadido para usar los servicios de PrimeNG
})
export class ScoutingComponent implements OnInit {

  jugadoresScouting: Jugador[] = []; // Usado JugadorLiga en lugar de Jugador
  cargando = true;
  jugadorSeleccionado: Jugador | null = null; // Para manejar el jugador seleccionado en el modal
  esVip = false; // Controla si el usuario tiene acceso VIP
  modalVisible = false; // Controla la visibilidad del modal de detalles

  constructor(
    private jugadorService: JugadorService,
    private authService: AuthService,
    private dialogService: DialogService, // Inyección del servicio de diálogos
    private messageService: MessageService // Inyección para mostrar mensajes
  ) { }

  ngOnInit(): void {
    const ligaId = this.authService.getLigaId();
    this.esVip = this.authService.esVip(); // Determina si el usuario es VIP

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

  // Método para mostrar los detalles del jugador en el modal
  mostrarDetalles(jugador: Jugador): void {
    this.jugadorSeleccionado = jugador;
    this.modalVisible = true;
  }

  // Método para cerrar el modal
  cerrarModal(): void {
    this.modalVisible = false;
  }

  // Método para mostrar un mensaje de advertencia si el jugador no es VIP
  mostrarMensajeNoVip(): void {
    this.messageService.add({ severity: 'warn', summary: 'Solo VIPs', detail: 'Las estadísticas avanzadas están disponibles solo para usuarios VIP.' });
  }
}
