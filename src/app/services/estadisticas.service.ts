import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jugador } from '../models/jugador.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private apiUrl = `${environment.apiUrl}/jugadores/estadisticas`;

  constructor(private http: HttpClient) {}

  obtenerEstadisticas(): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(this.apiUrl);
  }
}
