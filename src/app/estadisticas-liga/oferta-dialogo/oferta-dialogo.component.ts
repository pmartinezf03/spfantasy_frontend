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
  @Input() totalOfertasEnCurso!: number;
  @Output() cerrar = new EventEmitter<void>();
  @Output() enviarOferta = new EventEmitter<{ monto: number }>();
  @Input() modo: 'oferta' | 'contraoferta' = 'oferta';
  @Output() enviarContraoferta = new EventEmitter<{ monto: number }>();

  montoOferta: number = 0;
  mensajeError: string = '';

  cerrarDialogo() {
    console.log("❎ [Dialogo] Cerrar diálogo");
    this.cerrar.emit();
  }

  confirmarOferta() {
    if (this.montoOferta <= 0) {
      this.mensajeError = "❌ El monto de la oferta debe ser mayor a 0.";
      return;
    }
  
    console.log("📤 BOTÓN CONFIRMAR pulsado. Modo:", this.modo);
    console.log("💸 Monto introducido:", this.montoOferta);
  
    if (this.modo === 'oferta') {
      const totalPropuesto = this.totalOfertasEnCurso + this.montoOferta;
      if (totalPropuesto > this.usuarioDinero) {
        this.mensajeError = `❌ No tienes suficiente dinero. Fondos disponibles: ${this.usuarioDinero} €, ofertas en curso: ${this.totalOfertasEnCurso} €, oferta actual: ${this.montoOferta} €.`;  
        return;
      }
  
      console.log("✅ Emitiendo evento enviarOferta...");
      this.enviarOferta.emit({ monto: this.montoOferta });
  
    } else {
      console.log("✅ Emitiendo evento enviarContraoferta...");
      this.enviarContraoferta.emit({ monto: this.montoOferta });
    }
  
    this.cerrarDialogo();
  }
  
}
