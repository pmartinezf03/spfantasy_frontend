import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CrearLigaDTO {
  nombre: string;
  codigo: string;
  creadorId: number;
}

export interface UnirseLigaDTO {
  usuarioId: number;
  codigoInvitacion: string;
  contrasena: string
}

export interface Liga {
  id: number;
  nombre: string;
  codigoInvitacion: string;
  creador: any;
  maxParticipantes: number;
  iniciada: boolean;
}

export interface MiembroLiga {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class LigasService {

  private apiUrl = 'http://localhost:8080/api/ligas';

  constructor(private http: HttpClient) {}

  crearLiga(dto: CrearLigaDTO): Observable<Liga> {
    return this.http.post<Liga>(`${this.apiUrl}/crear`, dto);
  }

  unirseALiga(dto: UnirseLigaDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/unirse`, dto);
  }

  obtenerMiembros(ligaId: number): Observable<MiembroLiga[]> {
    return this.http.get<MiembroLiga[]>(`${this.apiUrl}/${ligaId}/miembros`);
  }

  salirDeLiga(ligaId: number, usuarioId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${ligaId}/salir/${usuarioId}`, { responseType: 'text' });
  }

  expulsarDeLiga(ligaId: number, usuarioId: number, creadorId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${ligaId}/expulsar/${usuarioId}?creadorId=${creadorId}`, { responseType: 'text' });
  }

  iniciarLiga(ligaId: number, creadorId: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${ligaId}/iniciar?creadorId=${creadorId}`, {}, { responseType: 'text' });
  }

  obtenerRanking(ligaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${ligaId}/ranking`);
  }
}
