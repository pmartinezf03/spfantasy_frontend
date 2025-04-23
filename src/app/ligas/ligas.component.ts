import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LigasService, MiembroLiga } from '../services/ligas.service';
import { Router } from '@angular/router';
import { Liga } from '../models/liga.model';
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
  usuario: any = null;

  constructor(
    public authService: AuthService,
    private ligasService: LigasService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user && user.id) {
      this.usuarioId = user.id;

      this.ligasService.obtenerLigaDelUsuario(this.usuarioId).subscribe({
        next: (liga) => {
          if (liga && liga.id) {
            this.authService.setLigaId(liga.id);
            this.authService.setLiga(liga);
            this.ligaActual = liga;
            this.ligaIniciada = liga.iniciada;
            this.esCreador = liga.creadorId === this.usuarioId;
            this.cargarMiembros();
          } else {
            this.ligaActual = null;
          }
        },
        error: () => {
          this.ligaActual = null;
        }
      });
    }

    this.authService.usuarioCompleto$.subscribe(user => {
      this.usuario = user;
    });
  }

  cargarLigaDelUsuario(): void {
    if (!this.usuarioId) return;

    this.ligasService.obtenerLigaDelUsuario(this.usuarioId).subscribe({
      next: liga => {
        if (liga) {
          this.authService.setLigaId(liga.id);
          this.ligaActual = liga;
          this.ligaIniciada = liga.iniciada;
          this.esCreador = liga.creadorId === this.usuarioId;
          this.cargarMiembros();
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
    this.authService.setLigaId(liga.id);
    this.authService.setLiga(liga);
    this.mostrarCrearLiga = false;
    this.esCreador = true;
    this.ligaIniciada = false;
    this.cargarMiembros();
    this.router.navigate(['/mercado']);
    this.authService.refreshUsuarioCompleto(); // refresca datos del usuario
  }

  onUnidoALiga(liga: Liga): void {
    this.ligaActual = liga;
    this.authService.setLigaId(liga.id);
    this.authService.setLiga(liga);
    this.mostrarUnirseLiga = false;
    this.esCreador = false;
    this.ligaIniciada = false;
    this.cargarMiembros();
    this.router.navigate(['/mercado']);
  }

  cargarMiembros(): void {
    if (!this.ligaActual?.id) return;

    this.ligasService.obtenerMiembros(this.ligaActual.id).subscribe({
      next: miembros => this.miembros = miembros,
      error: err => console.error('Error cargando miembros:', err)
    });
  }

  salirLiga(): void {
    const ligaId = this.ligaActual?.id;
    if (!ligaId || !this.usuarioId) return;

    this.ligasService.salirDeLiga(ligaId, this.usuarioId).subscribe({
      next: () => {
        this.ligaActual = null;
        this.miembros = [];
        this.authService.setLigaId(null);
        this.authService.setLiga(null);
        this.esCreador = false;
        this.ligaIniciada = false;
      },
      error: err => {
        console.error('❌ Error al salir de la liga:', err);
      }
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
