import { Component, OnInit } from '@angular/core';
import { LogrosService } from '../services/logros.service';
import { AuthService } from '../services/auth.service';
import { LogroDTO } from '../models/logro.model';

interface Logro {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  desbloqueado: boolean;
  fechaDesbloqueo?: Date;
}

@Component({
  selector: 'app-logros',
  templateUrl: './logros.component.html',
  styleUrls: ['./logros.component.css']
})
export class LogrosComponent implements OnInit {
  logros: Logro[] = [];

  constructor(
    private logrosService: LogrosService,
    private authService: AuthService
  ) { }

  logroSeleccionado: Logro | null = null;


  ngOnInit(): void {
    const usuario = this.authService.getUser();
    const usuarioId = usuario?.id;

    if (!usuarioId) {
      console.error('️ Usuario no logueado o ID no disponible.');
      return;
    }

    this.logrosService.getTodosConEstado(usuarioId).subscribe({
      next: (logrosDTO: LogroDTO[]) => {
        this.logros = logrosDTO.map(dto => ({
          ...dto,
          fechaDesbloqueo: dto.fechaDesbloqueo ? new Date(dto.fechaDesbloqueo) : undefined
        }));
      },
      error: err => {
        console.error('❌ Error cargando logros:', err);
      }
    });
  }

  mostrarDetalle(logro: Logro): void {
    if (logro.desbloqueado) {
      this.logroSeleccionado = logro;
    }
  }

}
