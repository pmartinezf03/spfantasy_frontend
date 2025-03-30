import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GrupoChat } from '../models/grupochat.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GrupoChatService {
  private apiUrl = `http://${environment.apiUrl}/api/grupos`; // URL del backend

  constructor(private http: HttpClient) {}

  // ✅ Obtener todos los grupos disponibles
  getGrupos(): Observable<GrupoChat[]> {
    return this.http.get<GrupoChat[]>(`${this.apiUrl}`);
  }

  // ✅ Crear un nuevo grupo
  crearGrupo(grupo: { nombre: string; descripcion: string; passwordGrupo: string; creadorId: number }): Observable<GrupoChat> {
    return this.http.post<GrupoChat>(`${this.apiUrl}/crear`, grupo);
  }

  // ✅ Unirse a un grupo
  unirseAGrupo(grupoId: number, usuarioId: number, passwordGrupo: string): Observable<GrupoChat> {
    return this.http.post<GrupoChat>(`${this.apiUrl}/unirse`, {
      grupoId,
      usuarioId,
      passwordGrupo
    });
  }
}
