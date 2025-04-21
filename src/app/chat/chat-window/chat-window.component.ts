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
    if (this.nuevoMensaje.trim()) {
      this.enviarMensaje.emit(this.nuevoMensaje.trim());
      this.nuevoMensaje = '';
      setTimeout(() => this.scrollToBottom(), 0); // scroll al enviar
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


  getColorClase(remitenteId: number): string {
    const colores = ['rojo', 'azul', 'verde', 'morado', 'naranja', 'rosa', 'cyan', 'amarillo'];
    return colores[remitenteId % colores.length];
  }

}
