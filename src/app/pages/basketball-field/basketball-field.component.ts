import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop'; 
@Component({
  selector: 'app-basketball-field',
  standalone: true, 
  imports: [CommonModule, DragDropModule], 
  templateUrl: './basketball-field.component.html',
  styleUrls: ['./basketball-field.component.css']
})
export class BasketballFieldComponent {
  players = [
    { id: 1, name: 'Jugador 1' },
    { id: 2, name: 'Jugador 2' },
    { id: 3, name: 'Jugador 3' },
    { id: 4, name: 'Jugador 4' },
    { id: 5, name: 'Jugador 5' },
    { id: 6, name: 'Jugador 6' }
  ];

  positions = [
    { id: 'pos1', player: null },
    { id: 'pos2', player: null },
    { id: 'pos3', player: null },
    { id: 'pos4', player: null },
    { id: 'pos5', player: null }
  ];

  dropPlayer(position: any, event: any) {
    const player = event.item.data;
    position.player = player;
    this.players = this.players.filter(p => p.id !== player.id);
  }
}
