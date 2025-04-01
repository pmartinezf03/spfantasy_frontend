import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LigasService, Liga, MiembroLiga } from '../services/ligas.service';
import { Router } from '@angular/router';

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
  esCreador = false;
  ligaIniciada = false;

  constructor(
    private authService: AuthService,
    private ligasService: LigasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUser();
    if (usuario) {
      this.usuarioId = usuario.id;
      this.cargarLigaDelUsuario();
    }
  }

  cargarLigaDelUsuario(): void {
    if (!this.usuarioId) return;

    this.ligasService.obtenerLigaDelUsuario(this.usuarioId).subscribe({
      next: ligaId => {
        if (ligaId) {
          this.authService.setLigaId(ligaId);

          this.ligasService.obtenerTodasLasLigas().subscribe(ligas => {
            const liga = ligas.find(l => l.id === ligaId);
            if (liga) {
              this.ligaActual = liga;
              this.ligaIniciada = liga.iniciada;
              this.esCreador = liga.creador?.id === this.usuarioId;
              this.cargarMiembros();
            }
          });
        }
      },
      error: () => {
        this.ligaActual = null;
        this.authService.setLigaId(null);
      }
    });
  }

  onLigaCreada(liga: Liga): void {
    this.ligaActual = liga;
    this.mostrarCrearLiga = false;
    this.authService.setLigaId(liga.id);
    this.cargarMiembros();
    this.esCreador = true;
    this.ligaIniciada = false;
    this.router.navigate(['/mercado']);
  }

  onUnidoALiga(liga: Liga): void {
    this.ligaActual = liga;
    this.mostrarUnirseLiga = false;
    this.authService.setLigaId(liga.id);
    this.cargarMiembros();
    this.esCreador = false;
    this.ligaIniciada = false;
    this.router.navigate(['/mercado']);
  }

  cargarMiembros(): void {
    if (!this.ligaActual?.id) return; // ✅ Prevención segura

    this.ligasService.obtenerMiembros(this.ligaActual.id).subscribe({
      next: miembros => this.miembros = miembros,
      error: err => console.error('Error cargando miembros:', err)
    });
  }


  salirLiga(): void {
    if (!this.ligaActual || !this.usuarioId) return;

    this.ligasService.salirDeLiga(this.ligaActual.id, this.usuarioId).subscribe({
      next: () => {
        this.ligaActual = null;
        this.miembros = [];
        this.authService.setLigaId(null);
        this.esCreador = false;
        this.ligaIniciada = false;
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
