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
  private reintentosPorCanal: Map<string, number> = new Map();
  private readonly LIMITE_REINTENTOS = 10;


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
      
    };

    this.stompClient.onWebSocketClose = () => 
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
      
      this.ofertasSubject.next(oferta);
    });
  }

  getOfertas() {
    return this.ofertasSubject.asObservable();
  }


  //  Generalizado para escuchar un canal concreto
  subscribeToChannel(channel: string): void {
    if (this.canalesSuscritos.has(channel)) {
      
      return;
    }

    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.subscribe(channel, (message) => {
        const msg = JSON.parse(message.body);
        
        this.messageSubject.next(msg);
      });

      this.canalesSuscritos.add(channel);
      
      this.reintentosPorCanal.delete(channel); // ✅ limpiar si conecta
    } else {
      const intentos = this.reintentosPorCanal.get(channel) ?? 0;

      if (intentos >= this.LIMITE_REINTENTOS) {
        console.warn(`❌ No se pudo conectar al canal ${channel} después de ${this.LIMITE_REINTENTOS} intentos.`);
        return;
      }

      this.reintentosPorCanal.set(channel, intentos + 1);
      console.warn(`⏳ Esperando conexión WebSocket para canal: ${channel} (intento ${intentos + 1})`);

      setTimeout(() => this.subscribeToChannel(channel), 1000);
    }
  }




  //  Canal entre alias
  getCanalPrivadoPorId(id1: number, id2: number): string {
    const ordenado = [id1, id2].sort((a, b) => a - b);
    return `/chat/privado/${ordenado[0]}-${ordenado[1]}`;
  }


  //  Canal de grupo de liga
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
