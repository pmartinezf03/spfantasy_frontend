import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { Message } from '../../models/message.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnChanges, AfterViewInit {
  @Input() mensajes: Message[] = [];
  @Input() usuarioActual!: Usuario;
  @Output() enviarMensaje = new EventEmitter<string>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  nuevoMensaje: string = '';
  mensajesOrdenados: Message[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mensajes']) {
      this.mensajesOrdenados = [...this.mensajes].sort((a, b) =>
        new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
      );
      requestAnimationFrame(() => this.scrollToBottom()); // scroll más fluido
    }
  }


  ngAfterViewInit(): void {
    this.scrollToBottom(); // inicial
  }

  enviar(): void {
    // ⚠️ VERIFICAR DESTINO
    if (!this.usuarioActual || !this.usuarioActual.id || !this.enviarMensaje.observers.length) return;

    if (this.nuevoMensaje.trim()) {
      this.enviarMensaje.emit(this.nuevoMensaje.trim());
      this.nuevoMensaje = '';
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }


  private scrollToBottom(): void {
    try {
      const container = this.scrollContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.warn("⚠️ Error en scroll:", err);
    }
  }


  // 🎨 Diccionario de colores por usuario
  private coloresUsuarios: { [id: number]: string } = {};

  private generarColorHex(): string {
    const letras = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letras[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  private getColorUsuario(id: number): string {
    if (!this.coloresUsuarios[id]) {
      this.coloresUsuarios[id] = this.generarColorHex();
    }
    return this.coloresUsuarios[id];
  }

  // ✅ Úsalo en el template
  getColorClase(remitenteId?: number, grupoId?: number): string {
    if (!remitenteId) return '#ccc';

    // Mensajes privados → colores fijos
    if (!grupoId) {
      return remitenteId === this.usuarioActual.id ? '#A7F3D0' : '#BFDBFE'; // verde pastel y azul pastel
    }

    // Mensajes de grupo → colores por usuario
    if (!this.coloresPorUsuario[remitenteId]) {
      this.coloresPorUsuario[remitenteId] = this.generarColorAleatorio();
    }

    return this.coloresPorUsuario[remitenteId];
  }

  private coloresPorUsuario: { [id: number]: string } = {};

  private generarColorAleatorio(): string {
    const colores = ['#FDE68A', '#FCA5A5', '#C4B5FD', '#6EE7B7', '#FBCFE8', '#93C5FD', '#F9A8D4'];
    return colores[Math.floor(Math.random() * colores.length)];
  }



}
