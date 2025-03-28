import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Jugador } from '../../models/jugador.model';

@Component({
  selector: 'app-oferta-dialogo',
  templateUrl: './oferta-dialogo.component.html',
  styleUrls: ['./oferta-dialogo.component.css']
})
export class OfertaDialogoComponent {
  @Input() mostrarDialogo: boolean = false;
  @Input() jugadorSeleccionado?: Jugador;
  @Input() usuarioId!: number;
  @Input() usuarioDinero!: number;
  @Input() totalOfertasEnCurso!: number;  // 🔹 Nuevo: total de ofertas activas
  @Output() cerrar = new EventEmitter<void>();
  @Output() enviarOferta = new EventEmitter<{ monto: number }>();

  montoOferta: number = 0;
  mensajeError: string = '';

  cerrarDialogo() {
    this.cerrar.emit();
  }

  confirmarOferta() {
    if (this.montoOferta <= 0) {
      this.mensajeError = "❌ El monto de la oferta debe ser mayor a 0.";
      return;
    }

    const totalPropuesto = this.totalOfertasEnCurso + this.montoOferta;

    if (totalPropuesto > this.usuarioDinero) {
      this.mensajeError = `❌ No tienes suficiente dinero. Fondos disponibles: ${this.usuarioDinero} €, ofertas en curso: ${this.totalOfertasEnCurso} €, oferta actual: ${this.montoOferta} €.`;
      return;  // ❌ No cerramos el diálogo
    }

    // ✅ Emitimos la oferta si los fondos son suficientes
    this.enviarOferta.emit({ monto: this.montoOferta });
    this.cerrarDialogo();
  }

}
