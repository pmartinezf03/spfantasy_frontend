import { Component, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { WebSocketService } from '../../app/services/websocket.service';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Message } from '../models/message.model';
import { Usuario } from '../models/usuario.model';
import { UsuarioService } from '../services/usuario.service';
import { GrupoChat } from '../models/grupochat.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnChanges {
  messages: Message[] = [];
  newMessage: string = '';
  currentUser: Usuario | null = null;
  usuarios: Usuario[] = [];
  gruposUsuario: GrupoChat[] = [];

  selectedGroupId: number | null = null;
  selectedUserId: number | null = null;

  contactoSeleccionado: Usuario | null = null;
  grupoSeleccionado: GrupoChat | null = null;

  mensajesPorConversacion: Map<string, Message[]> = new Map();
  notificacionesPendientes: Set<string> = new Set();
  ultimosLeidos: Map<string, number> = new Map();

  constructor(
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private http: HttpClient,
    private changeDetector: ChangeDetectorRef,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    this.authService.usuarioCompleto$.subscribe(user => {
      if (!user) return;

      this.currentUser = user;
      this.loadUsuarios();
      this.loadGruposDelUsuario();

      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);

      // Precargar mensajes históricos
      this.http.get<Message[]>(`${environment.apiUrl}/api/mensajes/${user.id}/todos`, { headers }).subscribe({
        next: (todos) => {
          todos.forEach((msg) => {
            const clave = this.getClaveConversacion(msg);
            if (!this.mensajesPorConversacion.has(clave)) {
              this.mensajesPorConversacion.set(clave, []);
            }
            this.mensajesPorConversacion.get(clave)!.push(msg);

            const yaLeido = this.ultimosLeidos.get(clave) ?? 0;
            const esPropio = msg.remitenteId === user.id;

            if (!esPropio && (msg.id ?? 0) > yaLeido) {
              this.notificacionesPendientes.add(clave);
            }
          });

          this.refreshVistaActual();
        },
        error: (err) => console.error("Error al precargar mensajes:", err)
      });

      // 🔔 SUSCRIBIRSE a todos los grupos del usuario (chat de liga incluido)
      this.http.get<GrupoChat[]>(`${environment.apiUrl}/api/grupos`, { headers }).subscribe(grupos => {
        grupos.forEach(grupo => {
          this.webSocketService.subscribeToChannel(
            this.webSocketService.getCanalGrupo(grupo.id)
          );
        });
      });

      // 🔔 SUSCRIBIRSE a todos los posibles chats privados por alias
      this.usuarioService.obtenerUsuarios().subscribe(usuarios => {
        this.usuarios = usuarios.filter(u => u.id !== this.currentUser!.id);

        this.usuarios.forEach(contacto => {
          if (contacto.alias && user.alias) {
            const canalPrivado = this.webSocketService.getCanalPrivado(user.alias, contacto.alias);
            this.webSocketService.subscribeToChannel(canalPrivado);
          }
        });
      });

      // 🔁 ESCUCHAR MENSAJES ENTRANTES
      this.webSocketService.getMessages().subscribe((message: Message) => {
        const clave = this.getClaveConversacion(message);
        if (!this.mensajesPorConversacion.has(clave)) {
          this.mensajesPorConversacion.set(clave, []);
        }

        const mensajes = this.mensajesPorConversacion.get(clave)!;
        if (!mensajes.some(m => m.id === message.id)) {
          mensajes.push(message);
          if (clave === this.getClaveActual()) {
            this.messages = [...mensajes];
            this.markAsRead(clave, message.id ?? 0);
            this.changeDetector.detectChanges();
          } else if (message.remitenteId !== this.currentUser?.id) {
            this.notificacionesPendientes.add(clave);
          }
        }
      });
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedGroupId'] || changes['selectedUserId']) {
      this.loadMessages();
    }
  }

  loadUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe((usuarios: Usuario[]) => {
      this.usuarios = usuarios.filter((u: Usuario) => u.id !== this.currentUser!.id);
    });

  }

  loadGruposDelUsuario(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    this.http.get<GrupoChat[]>(`${environment.apiUrl}/api/grupos`, { headers }).subscribe(grupos => {
      this.gruposUsuario = grupos.filter(grupo => grupo.usuariosIds?.includes(this.currentUser!.id));
    });
  }

  onUsuarioSeleccionado(usuarioId: number): void {
    this.selectedUserId = usuarioId;
    this.selectedGroupId = null;
    this.contactoSeleccionado = this.usuarios.find(u => u.id === usuarioId) || null;
    this.grupoSeleccionado = null;
    this.loadMessages();
  }

  onGrupoSeleccionado(grupoId: number): void {
    this.selectedGroupId = grupoId;
    this.selectedUserId = null;
    this.grupoSeleccionado = this.gruposUsuario.find(g => g.id === grupoId) || null;
    this.contactoSeleccionado = null;
    this.loadMessages();
  }

  loadMessages(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    if (this.selectedGroupId) {
      this.http.get<Message[]>(`${environment.apiUrl}/api/mensajes/grupo/${this.selectedGroupId}/dto`, { headers })
      .subscribe(data => this.messages = data);
    } else if (this.selectedUserId) {
      const clave = this.generarClavePrivada(this.currentUser!.id, this.selectedUserId);
      this.http.get<Message[]>(`${environment.apiUrl}/api/mensajes/privado/${this.currentUser!.id}/${this.selectedUserId}/dto`, { headers })
      .subscribe(data => this.messages = data);
    }
  }
  sendMessage(contenido: string): void {
    if (!contenido.trim() || !this.currentUser) return;

    const mensaje: Message = {
      remitenteId: this.currentUser.id,
      contenido: contenido.trim(),
      grupoId: this.selectedGroupId || undefined,
      destinatarioId: this.selectedUserId || undefined,
      timestamp: new Date().toISOString()
    };

    if (this.selectedGroupId) {
      const canalGrupo = this.webSocketService.getCanalGrupo(this.selectedGroupId);
      this.webSocketService.publishMessage(canalGrupo, mensaje);
    } else if (this.selectedUserId) {
      const destino = this.usuarios.find(u => u.id === this.selectedUserId);
      if (destino?.alias && this.currentUser.alias) {
        const canalPrivado = this.webSocketService.getCanalPrivado(this.currentUser.alias, destino.alias);
        this.webSocketService.publishMessage(canalPrivado, mensaje);
      } else {
        console.warn("❌ No se puede enviar el mensaje: alias no disponible.");
      }
    }
  }





  private refreshVistaActual(): void {
    const clave = this.getClaveActual();
    this.messages = this.mensajesPorConversacion.get(clave) || [];
    this.changeDetector.detectChanges();
  }

  private generarClavePrivada(id1: number, id2: number): string {
    return [id1, id2].sort((a, b) => a - b).join('-');
  }

  private getClaveActual(): string {
    return this.selectedGroupId ? `grupo-${this.selectedGroupId}` :
      this.selectedUserId ? `privado-${this.generarClavePrivada(this.currentUser!.id, this.selectedUserId)}` : '';
  }

  private getClaveConversacion(msg: Message): string {
    return msg.grupoId ? `grupo-${msg.grupoId}` :
      `privado-${this.generarClavePrivada(msg.remitenteId!, msg.destinatarioId!)}`;
  }

  private markAsRead(clave: string, ultimoId: number): void {
    this.ultimosLeidos.set(clave, ultimoId);
    this.notificacionesPendientes.delete(clave);
  }
}
