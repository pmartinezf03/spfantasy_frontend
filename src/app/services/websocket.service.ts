import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private messageSubject = new Subject<any>();
  private canalesSuscritos = new Set<string>();

  constructor() {
    this.connect();
  }

  private connect(): void {
    const socket = new SockJS(`${environment.apiUrl}/ws`);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (msg) => console.log('WebSocket Debug:', msg)
    });

    this.stompClient.onConnect = () => {
      console.log('🟢 Conectado al WebSocket');
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


  private ofertasSubject = new Subject<any>();

  subscribeToOfertas(usuarioId: number): void {
    this.stompClient.subscribe(`/chat/ofertas/${usuarioId}`, (message) => {
      const oferta = JSON.parse(message.body);
      console.log('🟢 Nueva oferta recibida por WebSocket:', oferta);
      this.ofertasSubject.next(oferta);
    });
  }

  getOfertas() {
    return this.ofertasSubject.asObservable();
  }


  // 🔔 Generalizado para escuchar un canal concreto
  subscribeToChannel(channel: string): void {
    if (this.canalesSuscritos.has(channel)) return;

    const intentarSuscripcion = () => {
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.subscribe(channel, (message) => {
          const msg = JSON.parse(message.body);
          this.messageSubject.next(msg);
        });
        this.canalesSuscritos.add(channel);
        console.log(`📡 Subscrito a canal: ${channel}`);
      } else {
        // 🕒 Reintentar hasta que conecte
        setTimeout(intentarSuscripcion, 500);
      }
    };

    intentarSuscripcion(); // 🟢 Intento inicial
  }



  // 🧠 Canal entre alias
  getCanalPrivado(alias1: string, alias2: string): string {
    const ordenado = [alias1, alias2].sort();
    return `/chat/privado/${ordenado[0]}-${ordenado[1]}`;
  }

  // 🎯 Canal de grupo de liga
  getCanalGrupo(grupoId: number): string {
    return `/chat/liga/${grupoId}`;
  }


  public publishMessage(destination: string, message: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({ destination, body: JSON.stringify(message) });
    } else {
      console.warn("❌ No conectado al WebSocket. No se puede enviar mensaje.");
    }
  }



}
