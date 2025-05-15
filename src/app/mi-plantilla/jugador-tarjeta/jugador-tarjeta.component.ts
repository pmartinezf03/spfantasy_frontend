import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Jugador } from '../../models/jugador.model';

@Component({
  selector: 'app-jugador-tarjeta',
  templateUrl: './jugador-tarjeta.component.html',
  styleUrls: ['./jugador-tarjeta.component.css']
})
export class JugadorTarjetaComponent {
  @Input() jugador!: Jugador;
  @Output() mostrarInfo = new EventEmitter<Jugador>();
  @Output() vender = new EventEmitter<Jugador>();
  @Output() menuSolicitado = new EventEmitter<Jugador>();

  onAbrirMenu(event: Event) {
    event.stopPropagation();
    this.menuSolicitado.emit(this.jugador);
  }
}
