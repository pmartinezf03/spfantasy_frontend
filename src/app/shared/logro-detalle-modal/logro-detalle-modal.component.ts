import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LogroDTO } from '../../models/logro.model';

@Component({
  selector: 'app-logro-detalle-modal',
  templateUrl: './logro-detalle-modal.component.html',
  styleUrls: ['./logro-detalle-modal.component.css']
})
export class LogroDetalleModalComponent {
  @Input() logro: LogroDTO | null = null;
  @Output() cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.cerrar.emit();
  }
}
