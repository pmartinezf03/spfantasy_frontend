import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GrupoChat } from '../../models/grupochat.model';
import { GrupoChatService } from '../../services/grupo-chat.service';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.css']
})
export class GruposComponent implements OnInit {
  @Input() notificacionesPendientes: Set<string> = new Set();
  @Output() grupoSeleccionado = new EventEmitter<number>();
  @Input() mensajesPorConversacion: Map<string, Message[]> = new Map();
  @Input() ultimosLeidos: Map<string, number> = new Map();
  @Input() usuarioActual!: Usuario;


  grupos: GrupoChat[] = [];
  usuarios: Usuario[] = [];
  nuevoGrupo: Partial<GrupoChat & { participantesIds?: number[] }> = {};
  usuarioId: number = 0;
  esAdmin: boolean = false;

  constructor(
    private grupoChatService: GrupoChatService,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.usuarioId = user ? user.id : 0;
    this.esAdmin = user?.role === 'admin';
    this.cargarGrupos();
    this.cargarUsuarios();
  }

  cargarGrupos(): void {
    this.grupoChatService.getGrupos().subscribe({
      next: (data) => (this.grupos = data),
      error: (err) => console.error('❌ Error al obtener los grupos:', err)
    });
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data.filter(u => u.id !== this.usuarioId);
      },
      error: (err) => console.error('❌ Error al cargar usuarios:', err)
    });
  }

  crearGrupo(): void {
    if (!this.nuevoGrupo.nombre || !this.usuarioId) return;

    const grupo = {
      nombre: this.nuevoGrupo.nombre,
      descripcion: this.nuevoGrupo.descripcion || '',
      passwordGrupo: this.nuevoGrupo.passwordGrupo || '',
      creadorId: this.usuarioId,
      participantesIds: [...(this.nuevoGrupo.participantesIds || []), this.usuarioId]
    };

    this.grupoChatService.crearGrupo(grupo).subscribe({
      next: (nuevoGrupo) => {
        this.grupos.push(nuevoGrupo);
        this.nuevoGrupo = {};
      },
      error: (err) => console.error('❌ Error al crear grupo:', err)
    });
  }

  emitirGrupoSeleccionado(id: number): void {
    this.grupoSeleccionado.emit(id);
  }

  tieneMensajesNuevosGrupo(grupoId: number): boolean {
    const clave = `grupo-${grupoId}`;
    const mensajes = this.mensajesPorConversacion.get(clave) || [];
    const ultimoLeido = this.ultimosLeidos.get(clave) || 0;

    return mensajes.some(m => m.id && m.id > ultimoLeido && m.remitenteId !== this.usuarioId);
  }



}
