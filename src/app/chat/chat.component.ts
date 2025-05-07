// 🔧 COMPLETO: chat.component.ts con scroll automático y mensajes agrupados por día

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

      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);

      // 1. Precargar mensajes históricos
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

      // 2. Subscribirse a grupos
      this.http.get<GrupoChat>(`${environment.apiUrl}/api/grupos/liga/${user.id}`, { headers }).subscribe(grupo => {
        const canal = this.webSocketService.getCanalGrupo(grupo.id);
        this.webSocketService.subscribeToChannel(canal);
        console.log("📡 Subscrito SOLO al canal de grupo del usuario:", canal);
        this.gruposUsuario = [grupo];
      });


      // 3. Obtener usuarios y subscribirse a canales privados
      this.usuarioService.obtenerUsuarios().subscribe(usuarios => {
        this.usuarios = usuarios.filter(u => u.id !== this.currentUser!.id);

        if (this.currentUser?.alias) {
          for (const contacto of this.usuarios) {
            if (contacto.alias) {
              const canalPrivado = this.webSocketService.getCanalPrivado(this.currentUser.alias, contacto.alias);
              this.webSocketService.subscribeToChannel(canalPrivado);
              console.log("📡 Subscrito a canal privado:", canalPrivado);
            }
          }
        } else {
          console.warn("⚠️ El usuario actual no tiene alias definido. No se puede subscribir a canales privados.");
        }
      });

      // 4. Escuchar mensajes entrantes
      this.webSocketService.getMessages().subscribe((message: Message) => {
        const clave = this.getClaveConversacion(message);
        if (!this.mensajesPorConversacion.has(clave)) {
          this.mensajesPorConversacion.set(clave, []);
        }

        const mensajes = this.mensajesPorConversacion.get(clave)!;
        const yaExiste = mensajes.some(m =>
          m.id && message.id ? m.id === message.id :
            m.timestamp === message.timestamp && m.contenido === message.contenido && m.remitenteId === message.remitenteId
        );

        if (!yaExiste) {
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

    const clave = this.generarClavePrivada(this.currentUser!.id, usuarioId);

    const mensajes = this.mensajesPorConversacion.get(`privado-${clave}`) || [];
    this.messages = [...mensajes]; // mostrar en pantalla

    // marcar como leídos
    const ultimoId = mensajes.length ? mensajes[mensajes.length - 1].id ?? 0 : 0;
    this.markAsRead(`privado-${clave}`, ultimoId);

    this.changeDetector.detectChanges();
    this.scrollChatToBottom(); // 👈 scroll automático
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
      const clave = `grupo-${this.selectedGroupId}`;
      this.http.get<Message[]>(`${environment.apiUrl}/api/mensajes/grupo/${this.selectedGroupId}/dto?limit=50`, { headers })
        .subscribe(data => {
          this.mensajesPorConversacion.set(clave, data);
          this.messages = [...data];
          this.scrollChatToBottom();
        });
    } else if (this.selectedUserId) {
      const clavePrivada = this.generarClavePrivada(this.currentUser!.id, this.selectedUserId);
      const clave = `privado-${clavePrivada}`;
      this.http.get<Message[]>(`${environment.apiUrl}/api/mensajes/privado/${this.currentUser!.id}/${this.selectedUserId}/dto?limit=50`, { headers })
        .subscribe(data => {
          this.mensajesPorConversacion.set(clave, data);
          this.messages = [...data];
          this.scrollChatToBottom();
        });
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

    // 👇 Añadir mensaje localmente para mostrarlo de inmediato
    const clave = this.getClaveActual();
    if (!this.mensajesPorConversacion.has(clave)) {
      this.mensajesPorConversacion.set(clave, []);
    }
    this.mensajesPorConversacion.get(clave)!.push(mensaje);
    this.messages = [...this.mensajesPorConversacion.get(clave)!];
    this.changeDetector.detectChanges();

    // 📤 Enviar mensaje por WebSocket
    this.webSocketService.sendMessage(mensaje);

  }


  private scrollChatToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.chat-window-scroll') as HTMLElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }

  private refreshVistaActual(): void {
    const clave = this.getClaveActual();
    this.messages = this.mensajesPorConversacion.get(clave) || [];
    this.changeDetector.detectChanges();
    this.scrollChatToBottom();
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
