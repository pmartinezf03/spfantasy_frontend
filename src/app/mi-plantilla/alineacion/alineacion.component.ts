import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Jugador } from '../../models/jugador.model';

@Component({
  selector: 'app-alineacion',
  templateUrl: './alineacion.component.html',
  styleUrls: ['./alineacion.component.css']
})
export class AlineacionComponent {
  @Input() jugadores: Jugador[] = [];
  @Input() banquillo: Jugador[] = [];
  @Output() cambiarJugador = new EventEmitter<{ jugador: Jugador, tipo: string }>();
  @Output() vender = new EventEmitter<Jugador>(); // ✅ Emitir evento de venta
  @Output() mostrarInfo = new EventEmitter<Jugador>(); // ✅ Emitir evento de mostrar información

  moverJugador(jugador: Jugador, tipo: string) {
    this.cambiarJugador.emit({ jugador, tipo });
  }

  venderJugador(jugador: Jugador) {
    console.log("💸 Emitiendo evento para vender jugador:", jugador);
    this.vender.emit(jugador);
  }

  mostrarInformacion(jugador: Jugador) {
    console.log("📌 Emitiendo evento para mostrar información de jugador:", jugador);
    this.mostrarInfo.emit(jugador);
  }
}
