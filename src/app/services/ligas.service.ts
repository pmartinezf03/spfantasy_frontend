import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Liga } from '../models/liga.model';
import { environment } from '../../environments/environment';

export interface CrearLigaDTO {
  nombre: string;
  codigoInvitacion: string;
  creadorId: number;
}

export interface ActividadLiga {
  id: number;
  tipo: string;
  descripcion: string;
  timestamp: string;
  usuario: {
    id: number;
    username: string;
    ultimoLogin: string;
  };
}





export interface UnirseLigaDTO {
  usuarioId: number;
  codigoInvitacion: string;
  contrasena: string
}



export interface MiembroLiga {
  id: number;
  username: string;
  email: string;
  ultimoLogin: string;
}


@Injectable({
  providedIn: 'root'
})
export class LigasService {

  private apiUrl = `${environment.apiUrl}/api/ligas`;

  constructor(private http: HttpClient) { }

  crearLiga(dto: CrearLigaDTO): Observable<Liga> {
    return this.http.post<Liga>(`${this.apiUrl}/crear`, dto);
  }

  unirseALiga(dto: UnirseLigaDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/unirse`, dto);
  }

  obtenerMiembros(ligaId: number): Observable<MiembroLiga[]> {
    return this.http.get<MiembroLiga[]>(`${this.apiUrl}/${ligaId}/miembros`);
  }
  obtenerMiembrosLiga(ligaId: number): Observable<MiembroLiga[]> {
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

  obtenerLigaDelUsuario(usuarioId: number): Observable<Liga | null> {
    return this.http.get<Liga>(`${this.apiUrl}/usuario/${usuarioId}/liga`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.warn("ℹ️ Usuario sin liga actualmente");
          return of(null); // Usuario sin liga
        } else {
          console.error("❌ Error inesperado al consultar liga:", error);
          return throwError(() => error); // Otro error real
        }
      })
    );
  }




  actualizarLiga(dto: any): Observable<string> {
    return this.http.put(`${this.apiUrl}/actualizar`, dto, { responseType: 'text' });
  }

  obtenerTodasLasLigas(): Observable<Liga[]> {
    return this.http.get<Liga[]>(`${this.apiUrl}/todas`);
  }

  obtenerActividadLiga(ligaId: number): Observable<ActividadLiga[]> {
    return this.http.get<ActividadLiga[]>(`${this.apiUrl}/${ligaId}/actividad`);
  }


}
