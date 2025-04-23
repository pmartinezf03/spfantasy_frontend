import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LigasService, MiembroLiga } from '../../services/ligas.service';
import { Liga } from '../../models/liga.model';
@Component({
  selector: 'app-esperando-miembros',
  templateUrl: './esperando-miembros.component.html',
  styleUrls: ['./esperando-miembros.component.css']
})
export class EsperandoMiembrosComponent implements OnInit, OnChanges {
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ligaId'] && this.ligaId) {
      this.cargarMiembros();
    }
  }

  cargarMiembros(): void {
    if (!this.ligaId) {
      console.warn("⚠ No se puede cargar miembros, ligaId es undefined.");
      return;
    }

    this.ligasService.obtenerMiembros(this.ligaId).subscribe({
      next: data => this.miembros = data,
      error: err => console.error("❌ Error cargando miembros:", err)
    });
  }

  iniciarLiga(): void {
    if (!this.ligaId || !this.usuarioId) return;

    this.ligasService.iniciarLiga(this.ligaId, this.usuarioId).subscribe({
      next: () => window.location.reload(),
      error: err => console.error("❌ Error al iniciar la liga:", err)
    });
  }

  esCreador(): boolean {
    return this.usuarioId === this.creadorId;
  }
}
