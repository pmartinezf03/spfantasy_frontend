import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private messageSubject = new Subject<any>();

  constructor() {
    this.connect();
  }

  private connect(): void {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // Reintentar conexión si se pierde
      debug: (msg) => console.log('WebSocket Debug:', msg)
    });

    this.stompClient.onConnect = () => {
      console.log('🟢 Conectado al WebSocket');
      this.stompClient.subscribe('/chat/mensajes', (message) => {
        this.messageSubject.next(JSON.parse(message.body));
      });
    };

    this.stompClient.onWebSocketClose = () => console.log('🔴 WebSocket desconectado');
    this.stompClient.activate();
  }

  getMessages() {
    return this.messageSubject.asObservable();
  }

  sendMessage(message: any) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({ destination: '/app/chat/enviar', body: JSON.stringify(message) });
    }
  }
}
