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



  get idDropLists(): string[] {
    return [...Object.keys(this.jugadoresPorPosicion).map(p => `drop-${p}`), 'banquillo'];
  }


  onDropEnSlot(event: CdkDragDrop<Jugador[]>, posicionDestino: string) {
    const jugador = event.item.data as Jugador;
    if (!jugador) {
      console.warn('⚠ No se pudo obtener el jugador del evento de drag.');
      return;
    }

    const origen = event.previousContainer.data;
    const destino = this.jugadoresPorPosicion[posicionDestino];

    const posicionJugadorOriginal = jugador.posicion;
    const posicionJugadorNormalizada = this.normalizarPosicion(posicionJugadorOriginal);
    const posicionDestinoNormalizada = this.normalizarPosicion(posicionDestino);

    console.log(`🔄 Intentando mover a: ${jugador.nombre} (${posicionJugadorOriginal})`);
    console.log(`🎯 Slot destino: ${posicionDestino}`);
    console.log(`📦 Jugadores actuales en "${posicionDestino}":`, destino);

    const posicionCompatible =
      posicionDestinoNormalizada === posicionJugadorNormalizada ||
      (['pivot', 'ala-pivot'].includes(posicionDestinoNormalizada) &&
        ['pivot', 'ala-pivot'].includes(posicionJugadorNormalizada));

    if (!posicionCompatible) {
      console.warn(`❌ Posición incompatible: ${posicionJugadorOriginal} no puede ir en ${posicionDestino}`);
      return;
    }

    if (destino.length >= 1 && event.previousContainer !== event.container) {
      console.warn(`❌ Ya hay un jugador en la posición ${posicionDestino}, no se puede agregar otro.`);
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(destino, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(origen, destino, event.previousIndex, event.currentIndex);
      this.cambiarJugador.emit({ jugador, tipo: 'titular' });
    }

    console.log(`✅ Jugador ${jugador.nombre} ahora en posición ${posicionDestino}`);
  }




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


  venderJugador(jugador: Jugador) {
    this.vender.emit(jugador);
  }

  mostrarInformacion(jugador: Jugador) {
    this.mostrarInfo.emit(jugador);
  }

  private normalizarPosicion(pos: string): string {
    return pos
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quita tildes
      .toLowerCase()
      .replace(/\s|-/g, '') // quita espacios y guiones
      .replace('alapivot', 'alaPivot'); // deja esta como camelCase
  }
  getClassPosicion(pos: string): string {
    return 'posicion-' + pos
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s|-/g, '');
  }


}
