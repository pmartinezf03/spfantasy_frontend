import { Component, OnInit } from '@angular/core';
import { TransaccionService } from '../../services/transaccion.service';
import { AuthService } from '../../services/auth.service';
import { Transaccion } from '../../models/transaccion.model'; 
@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  historial: Transaccion[] = [];   historialFiltrado: Transaccion[] = [];   filtroNombre: string = '';

  constructor(
    private transaccionService: TransaccionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const ligaId = this.authService.getLigaId();
    if (!ligaId) return;

    this.transaccionService.obtenerHistorialLiga(ligaId).subscribe({
      next: (data) => {
        this.historial = data.sort((a, b) => b.fecha.localeCompare(a.fecha));
        this.historialFiltrado = [...this.historial];
      },
      error: (err) => {
        console.error('❌ Error al cargar historial de liga:', err);
      }
    });
  }

  filtrar(): void {
    const termino = this.filtroNombre.trim().toLowerCase();
    this.historialFiltrado = this.historial.filter(h =>
      h.nombreJugador.toLowerCase().includes(termino)
    );
  }
}
