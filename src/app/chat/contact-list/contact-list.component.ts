import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit, OnChanges {
  @Input() usuarioActual!: Usuario;
  @Input() notificacionesPendientes: Set<string> = new Set();
  @Input() mensajesPorConversacion: Map<string, any[]> = new Map();
  @Input() ultimosLeidos: Map<string, number> = new Map();

  @Output() usuarioSeleccionado = new EventEmitter<number>();

  usuarios: Usuario[] = [];
  nuevoContactoAlias: string = '';
  mensaje: string = '';
  filtroContacto: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser) return;

    this.usuarioService.obtenerUsuarios().subscribe((data: Usuario[]) => {
      this.usuarios = data.filter(u => u.id !== currentUser.id);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notificacionesPendientes']) {
      this.notificacionesPendientes = new Set(this.notificacionesPendientes);
    }
  }

  generarClavePrivada(id1: number, id2: number): string {
    return [id1, id2].sort((a, b) => a - b).join('-');
  }

  tieneMensajesNuevos(usuario: Usuario): boolean {
    const clave = 'privado-' + this.generarClavePrivada(this.usuarioActual.id, usuario.id);
    const mensajes = this.mensajesPorConversacion.get(clave) || [];
    const ultimoLeido = this.ultimosLeidos.get(clave) || 0;

    return mensajes.some(m => {
      const remitenteId = m.remitenteId ?? m.remitente?.id ?? -999;
      return m.id && m.id > ultimoLeido && remitenteId !== this.usuarioActual.id;
    });
  }

  seleccionarContacto(id: number): void {
    this.usuarioSeleccionado.emit(id);
  }

  agregarContacto(): void {
    if (!this.nuevoContactoAlias.trim()) return;

    const aliasLower = this.nuevoContactoAlias.toLowerCase();

    const yaExiste = this.usuarios.some(
      u => u.alias?.toLowerCase() === aliasLower
    );

    if (yaExiste) {
      this.mensaje = '⚠️ Este contacto ya está en tu lista.';
      return;
    }

    this.usuarioService.obtenerUsuarios().subscribe((data: Usuario[]) => {
      const encontrado = data.find(
        u => u.alias?.toLowerCase() === aliasLower
      );

      if (encontrado) {
        this.usuarios.push(encontrado);
        this.mensaje = `✅ ${encontrado.username} (@${encontrado.alias}) añadido.`;
        this.nuevoContactoAlias = '';
      } else {
        this.mensaje = '❌ Alias no encontrado.';
      }
    });
  }

  trackByUsuarioId(index: number, usuario: Usuario): number {
    return usuario.id;
  }
}
