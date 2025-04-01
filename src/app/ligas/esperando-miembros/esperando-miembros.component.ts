import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Liga, LigasService, MiembroLiga } from '../../services/ligas.service';

@Component({
  selector: 'app-esperando-miembros',
  templateUrl: './esperando-miembros.component.html',
  styleUrls: ['./esperando-miembros.component.css']
})
export class EsperandoMiembrosComponent implements OnInit {
  @Input() ligaId!: number;
  @Input() creadorId!: number;
  @Input() miembros: MiembroLiga[] = [];
  @Input() liga!: Liga;

  usuarioId!: number;

  constructor(
    private ligasService: LigasService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usuarioId = this.authService.getUserId()!;
    this.cargarMiembros();
  }

  cargarMiembros(): void {
    this.ligasService.obtenerMiembros(this.ligaId).subscribe({
      next: data => this.miembros = data,
      error: err => console.error(err)
    });
  }

  iniciarLiga(): void {
    this.ligasService.iniciarLiga(this.ligaId, this.usuarioId).subscribe({
      next: () => window.location.reload(), // o notificar con Output si prefieres
      error: err => console.error(err)
    });
  }

  esCreador(): boolean {
    return this.usuarioId === this.creadorId;
  }
}
