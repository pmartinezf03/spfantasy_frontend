import { Component, EventEmitter, Output } from '@angular/core';
import { LigasService, Liga } from '../../services/ligas.service';
import { AuthService } from '../../services/auth.service';

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
      codigo: this.codigoInvitacion,
      creadorId: usuario.id
    }).subscribe({
      next: liga => {
        this.ligaCreada.emit(liga);
        this.error = null;
      },
      error: err => {
        this.error = err.error?.message || 'Error al crear la liga';
      }
    });
  }
}
