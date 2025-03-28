import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jugador } from '../models/jugador.model';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private apiUrl = 'http://localhost:8080/jugadores/estadisticas'; // Cambia si el backend tiene otra URL

  constructor(private http: HttpClient) {}

  obtenerEstadisticas(): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(this.apiUrl);
  }
}
