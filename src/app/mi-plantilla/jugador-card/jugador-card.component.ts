import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Jugador } from '../../models/jugador.model';

@Component({
  selector: 'app-jugador-card',
  templateUrl: './jugador-card.component.html',
  styleUrls: ['./jugador-card.component.css']
})
export class JugadorCardComponent {
  @Input() jugador!: Jugador;
  @Input() tipo!: string;

  @Output() mover = new EventEmitter<{ jugador: Jugador; tipo: string }>();
  @Output() mostrarInfo = new EventEmitter<Jugador>();
  @Output() vender = new EventEmitter<Jugador>();

  menuVisible: boolean = false;

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuVisible = !this.menuVisible;
  }

  moverJugador(event: Event): void {
    event.stopPropagation();
    const nuevoTipo = this.tipo === 'titular' ? 'banquillo' : 'titular';
    this.mover.emit({ jugador: this.jugador, tipo: nuevoTipo });
    this.menuVisible = false;
  }


  verInformacion(event: Event): void {
    event.stopPropagation();
    this.mostrarInfo.emit(this.jugador);
    this.menuVisible = false;
  }

  venderJugador(event: Event): void {
    event.stopPropagation();
    console.log("📤 Emitiendo evento de venta desde JugadorCardComponent:", this.jugador);
    this.vender.emit(this.jugador);
    this.menuVisible = false;
  }
}
