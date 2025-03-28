import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  usuario = {
    nombre: 'Pablo',
    liga: 'Liga Pro',
    puntos: 1250
  };

  proximosPartidos = [
    { equipo1: 'Lakers', equipo2: 'Warriors', fecha: '10 Mar 20:00' },
    { equipo1: 'Celtics', equipo2: 'Nets', fecha: '11 Mar 21:00' }
  ];
}
