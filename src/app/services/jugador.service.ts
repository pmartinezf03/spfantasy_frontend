import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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

  obtenerJugadoresDestacados(ligaId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/jugadores-liga/destacados`, {
      params: { ligaId: ligaId.toString() }
    });
  }


  obtenerJugadoresDeUsuarioEnLiga(ligaId: number, usuarioId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/jugadores-liga/mis-jugadores`, {
      params: {
        ligaId: ligaId.toString(),
        usuarioId: usuarioId.toString()
      }
    }).pipe(
      tap(jugadores => {
        console.log("📦 [SERVICE] Jugadores recibidos desde el backend:");
        console.table(jugadores); // 🔍 esto te mostrará si vienen 'rendimiento' y 'puntosTotales'
      })
    );
  }

  obtenerJugadoresPorLiga(ligaId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/jugadores-liga/liga`, {
      params: { ligaId: ligaId.toString() }
    }).pipe(
      tap(jugadores => {
        console.log('📊 [SERVICE] Jugadores por liga cargados para el comparador:');
        console.table(jugadores);
      })
    );
  }

  obtenerMediaPorPosicion(posicion: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/jugadores/media/${posicion}`);
  }
  getMediasPorPosicion(posicion: string) {
    return this.http.get<{ fp: number; min: number; t2: number; t3: number }>(
      `${this.apiUrl}/jugadores/media/${posicion}`
    );
  }




}
