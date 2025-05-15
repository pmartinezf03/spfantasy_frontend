import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Jugador } from '../../models/jugador.model';

@Component({
  selector: 'app-alineacion',
  templateUrl: './alineacion.component.html',
  styleUrls: ['./alineacion.component.css']
})
export class AlineacionComponent {
  @Input() jugadoresPorPosicion: { [posicion: string]: Jugador[] } = {};
  @Input() banquillo: Jugador[] = [];
  @Output() cambiarJugador = new EventEmitter<{ jugador: Jugador, tipo: string }>();
  @Output() vender = new EventEmitter<Jugador>();
  @Output() mostrarInfo = new EventEmitter<Jugador>();

  posiciones: string[] = ['base', 'escolta', 'alero', 'alaPivot', 'pivot'];

  // Estado del menú emergente
  menuVisible: boolean = false;
  jugadorSeleccionado: Jugador | null = null;

  // 🔄 IDs para drag & drop
  get idDropLists(): string[] {
    return [...Object.keys(this.jugadoresPorPosicion).map(p => `drop-${p}`), 'banquillo'];
  }

  // 📦 Al soltar en posición titular
  onDropEnSlot(event: CdkDragDrop<Jugador[]>, posicionDestino: string) {
    const jugador = event.item.data as Jugador;
    if (!jugador) return;

    const origen = event.previousContainer.data;
    const destino = this.jugadoresPorPosicion[posicionDestino];

    const posOriginal = this.normalizarPosicion(jugador.posicion);
    const posDestino = this.normalizarPosicion(posicionDestino);

    const posicionCompatible =
      posDestino === posOriginal ||
      (['pivot', 'alapivot'].includes(posDestino) &&
        ['pivot', 'alapivot'].includes(posOriginal));

    if (!posicionCompatible) {
      console.warn(`❌ Posición incompatible: ${jugador.posicion} no puede ir en ${posicionDestino}`);
      return;
    }

    if (destino.length >= 1 && event.previousContainer !== event.container) {
      console.warn(`❌ Ya hay un jugador en la posición ${posicionDestino}`);
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(destino, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(origen, destino, event.previousIndex, event.currentIndex);
      this.cambiarJugador.emit({ jugador, tipo: 'titular' });
    }
  }

  // 📦 Al soltar en banquillo
  onDropBanquillo(event: CdkDragDrop<Jugador[]>) {
    const jugador = event.item.data as Jugador;
    if (!jugador) return;

    const origen = event.previousContainer.data;

    if (event.previousContainer === event.container) {
      moveItemInArray(this.banquillo, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(origen, this.banquillo, event.previousIndex, event.currentIndex);
      this.cambiarJugador.emit({ jugador, tipo: 'banquillo' });
    }
  }

  // 🚀 Acciones del menú emergente
  abrirMenu(jugador: Jugador) {
    this.jugadorSeleccionado = jugador;
    this.menuVisible = true;
  }

  cerrarMenu() {
    this.menuVisible = false;
    this.jugadorSeleccionado = null;
  }

  venderJugador(jugador: Jugador) {
    this.vender.emit(jugador);
    this.cerrarMenu();
  }

  mostrarInformacion(jugador: Jugador) {
    this.mostrarInfo.emit(jugador);
    this.cerrarMenu();
  }

  // 🧩 Utilidades
  private normalizarPosicion(pos: string): string {
    return pos
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s|-/g, '')
      .replace('alapivot', 'alaPivot');
  }

  getClassPosicion(pos: string): string {
    return 'posicion-' + this.normalizarPosicion(pos);
  }
}
