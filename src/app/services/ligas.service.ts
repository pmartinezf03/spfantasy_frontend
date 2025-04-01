import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

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

  constructor(private http: HttpClient,
    private authService: AuthService,

  ) { }

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

  // ligas.service.ts
  obtenerLigaDelUsuario(usuarioId: number): Observable<number | null> {
    return this.http.get<number>(`${this.apiUrl}/usuario/${usuarioId}/liga`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  actualizarLiga(dto: any): Observable<string> {
    return this.http.put(`${this.apiUrl}/actualizar`, dto, { responseType: 'text' });
  }

  obtenerTodasLasLigas(): Observable<Liga[]> {
    return this.http.get<Liga[]>(`${this.apiUrl}/todas`, {
      headers: this.authService.getAuthHeaders()
    });
  }




}
