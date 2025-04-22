import { Component, Input, OnInit } from '@angular/core';
import { LigasService, MiembroLiga, Liga } from '../../services/ligas.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gestionar-liga',
  templateUrl: './gestionar-liga.component.html',
  styleUrls: ['./gestionar-liga.component.css']
})
export class GestionarLigaComponent implements OnInit {

  @Input() liga!: Liga;
  @Input() miembros: MiembroLiga[] = [];


  usuarioId!: number;

  nuevaContrasena = '';
  nuevoMaxParticipantes = this.liga?.maxParticipantes || 10;

  constructor(
    private ligasService: LigasService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const liga = this.authService.getLiga(); // si usas objeto completo
    // const ligaId = this.authService.getLigaId(); // si usas solo el ID
  
    if (liga) {
      this.liga = liga;
      this.ligasService.obtenerMiembros(liga.id).subscribe({
        next: miembros => this.miembros = miembros,
        error: err => console.error("Error al cargar miembros:", err)
      });
    } else {
      console.warn("⚠️ Liga no definida al iniciar el componente");
    }
  }
  
  cargarMiembros(): void {
    this.ligasService.obtenerMiembros(this.liga.id).subscribe({
      next: data => this.miembros = data,
      error: err => console.error('Error al cargar miembros:', err)
    });
  }

  guardarCambios(): void {
    const dto = {
      ligaId: this.liga.id,
      creadorId: this.usuarioId,
      contrasena: this.nuevaContrasena,
      maxParticipantes: this.nuevoMaxParticipantes
    };

    this.ligasService.actualizarLiga(dto).subscribe({
      next: () => alert('Cambios guardados correctamente'),
      error: err => alert('Error al guardar cambios: ' + err.message)
    });
  }

  expulsarUsuario(usuarioId: number): void {
    this.ligasService.expulsarDeLiga(this.liga.id, usuarioId, this.usuarioId).subscribe({
      next: () => {
        this.miembros = this.miembros.filter(m => m.id !== usuarioId);
      },
      error: err => alert('Error al expulsar: ' + err.message)
    });
  }

  esCreador(): boolean {
    return this.usuarioId === this.liga.creador.id;
  }
}
