import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LigasService, Liga, MiembroLiga } from '../services/ligas.service';

@Component({
  selector: 'app-ligas',
  templateUrl: './ligas.component.html',
  styleUrls: ['./ligas.component.css']
})
export class LigasComponent implements OnInit {

  usuarioId: number | null = null;
  ligaActual: Liga | null = null;
  miembros: MiembroLiga[] = [];
  mostrarCrearLiga = false;
  mostrarUnirseLiga = false;

  constructor(
    private authService: AuthService,
    private ligasService: LigasService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUser(); // debe devolver el objeto usuario actual
    if (usuario) {
      this.usuarioId = usuario.id;
      this.cargarLigaActual();
    }
  }

  cargarLigaActual(): void {
    // Este método puede mejorarse si tienes un endpoint que devuelva la liga del usuario directamente
    // De momento, simplemente dejamos al usuario elegir acción si no se puede recuperar automáticamente
  }

  onLigaCreada(liga: Liga): void {
    this.ligaActual = liga;
    this.mostrarCrearLiga = false;
    this.cargarMiembros();
  }

  onUnidoALiga(liga: Liga): void {
    this.ligaActual = liga;
    this.mostrarUnirseLiga = false;
    this.cargarMiembros();
  }

  cargarMiembros(): void {
    if (this.ligaActual) {
      this.ligasService.obtenerMiembros(this.ligaActual.id).subscribe({
        next: miembros => this.miembros = miembros,
        error: err => console.error('Error cargando miembros:', err)
      });
    }
  }

  salirLiga(): void {
    if (!this.ligaActual || !this.usuarioId) return;

    this.ligasService.salirDeLiga(this.ligaActual.id, this.usuarioId).subscribe({
      next: () => {
        this.ligaActual = null;
        this.miembros = [];
      },
      error: err => console.error('Error al salir de la liga:', err)
    });
  }

  mostrarCrear(): void {
    this.mostrarCrearLiga = true;
    this.mostrarUnirseLiga = false;
  }

  mostrarUnirse(): void {
    this.mostrarUnirseLiga = true;
    this.mostrarCrearLiga = false;
  }
}
