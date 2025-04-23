import { Component, EventEmitter, Output } from '@angular/core';
import { LigasService } from '../../services/ligas.service';
import { AuthService } from '../../services/auth.service';
import { Liga } from '../../models/liga.model';

@Component({
  selector: 'app-crear-liga',
  templateUrl: './crear-liga.component.html',
  styleUrls: ['./crear-liga.component.css']
})
export class CrearLigaComponent {
  nombre: string = '';
  codigoInvitacion: string = '';
  error: string | null = null;

  @Output() ligaCreada = new EventEmitter<Liga>();

  constructor(
    private ligasService: LigasService,
    private authService: AuthService
  ) {}

  crearLiga(): void {
    const usuario = this.authService.getUser();
    if (!usuario) {
      this.error = 'No has iniciado sesión';
      return;
    }

    this.ligasService.crearLiga({
      nombre: this.nombre,
      codigoInvitacion: this.codigoInvitacion, // ✅ CORRECTO
      creadorId: usuario.id
    }).subscribe({
      next: liga => {
        this.authService.setLiga(liga); // ✅ Guarda la liga en el servicio
        this.authService.setLigaId(liga.id); // ✅ Guarda el ID también
        this.ligaCreada.emit(liga);
                this.error = null;
      },
      error: err => {
        this.error = err.error?.message || 'Error al crear la liga';
      }
    });

  }
}
