import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jugador } from '../models/jugador.model';

@Injectable({
  providedIn: 'root'
})
export class JugadorService {
  private apiUrl = 'http://localhost:8080/jugadores';

  constructor(private http: HttpClient) { }

  obtenerJugadores(): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(this.apiUrl);
  }

  obtenerJugadorPorId(id: number): Observable<Jugador> {
    return this.http.get<Jugador>(`${this.apiUrl}/${id}`);
  }

  obtenerJugadoresDisponibles(): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`http://localhost:8080/jugadores/mercado`);
  }

}
