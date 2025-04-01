import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LigasService, Liga } from '../../services/ligas.service';

@Component({
  selector: 'app-unirse-liga',
  templateUrl: './unirse-liga.component.html',
  styleUrls: ['./unirse-liga.component.css']
})
export class UnirseLigaComponent {
  codigo: string = '';
  contrasena: string = '';
  error: string | null = null;

  @Output() unido = new EventEmitter<Liga>();

  constructor(
    private ligasService: LigasService,
    private authService: AuthService
  ) {}

  unirse(): void {
    const usuario = this.authService.getUser();
    if (!usuario) {
      this.error = 'Debes iniciar sesión';
      return;
    }

    this.ligasService.unirseALiga({
      usuarioId: usuario.id,
      codigoInvitacion: this.codigo,
      contrasena: this.contrasena
    }).subscribe({
      next: liga => {
        this.unido.emit(liga);
        this.error = null;
      },
      error: err => {
        this.error = err.error?.message || 'Error al unirse a la liga';
      }
    });
  }
}
