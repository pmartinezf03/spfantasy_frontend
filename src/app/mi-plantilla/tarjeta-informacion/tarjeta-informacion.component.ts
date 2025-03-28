import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Jugador } from '../../models/jugador.model';

@Component({
  selector: 'app-tarjeta-informacion',
  templateUrl: './tarjeta-informacion.component.html',
  styleUrls: ['./tarjeta-informacion.component.css']
})
export class TarjetaInformacionComponent {
  @Input() jugador!: Jugador; // Recibe el jugador seleccionado
  @Output() cerrar = new EventEmitter<void>(); // Evento para cerrar el modal

  cerrarInformacion(): void {
    this.cerrar.emit(); // Emitir evento al hacer clic en cerrar
  }
}
