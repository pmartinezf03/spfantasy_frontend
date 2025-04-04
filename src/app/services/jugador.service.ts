import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jugador } from '../models/jugador.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JugadorService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  obtenerJugadores(): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(this.apiUrl);
  }

  obtenerJugadorPorId(id: number): Observable<Jugador> {
    return this.http.get<Jugador>(`${this.apiUrl}/${id}`);
  }

  obtenerJugadoresDisponibles(): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${environment.apiUrl}/jugadores/mercado`);
  }

  // jugador.service.ts (o mi-plantilla.service.ts)

  // JugadorService o MiPlantillaService

  obtenerJugadoresDeUsuarioEnLiga(ligaId: number, usuarioId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/jugadores-liga/mis-jugadores`, {
      params: {
        ligaId: ligaId.toString(),
        usuarioId: usuarioId.toString()
      }
    });
  }

}
