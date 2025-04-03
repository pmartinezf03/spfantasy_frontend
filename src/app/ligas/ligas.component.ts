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
    const user = this.authService.getUser();
    if (user && user.id) {
      this.usuarioId = user.id;
  
      this.ligasService.obtenerLigaDelUsuario(this.usuarioId).subscribe({
        next: (liga) => {
          console.log("✅ Liga detectada del usuario:", liga);
  
          if (liga) {
            this.authService.setLigaId(liga.id);
            this.authService.setLiga(liga); // ✅ objeto completo
            this.ligaActual = liga;
            this.ligaIniciada = liga.iniciada;
            this.esCreador = liga.creador?.id === this.usuarioId;
            this.cargarMiembros();
          } else {
            this.ligaActual = null;
          }
        },
        error: (err) => {
          console.warn("ℹ️ Usuario no tiene liga:", err);
          this.ligaActual = null;
        }
      });
    }
  }
  


  cargarLigaDelUsuario(): void {
    if (!this.usuarioId) return;

    this.ligasService.obtenerLigaDelUsuario(this.usuarioId).subscribe({
      next: liga => {
        if (liga) {
          this.authService.setLigaId(liga.id); // ✅ Guarda el ID
          this.ligaActual = liga;
          this.ligaIniciada = liga.iniciada;
          this.esCreador = liga.creador?.id === this.usuarioId;
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
    this.authService.setLiga(liga); // ✅ añadimos esto
    this.mostrarCrearLiga = false;
    this.esCreador = true;
    this.ligaIniciada = false;
    this.cargarMiembros();
    this.router.navigate(['/mercado']);
  }
  
  onUnidoALiga(liga: Liga): void {
    this.ligaActual = liga;
    this.authService.setLigaId(liga.id);
    this.authService.setLiga(liga); // ✅ añadimos esto
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
        this.authService.setLiga(null); // ✅ Limpieza
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
