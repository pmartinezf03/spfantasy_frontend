import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jugador } from '../models/jugador.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  obtenerEstadisticas(): Observable<Jugador[]> {
    const ligaId = this.authService.getLigaId();

    if (!ligaId) {
      console.warn("⚠ No hay ligaId disponible para estadísticas.");
      return new Observable<Jugador[]>(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    const params = new HttpParams().set('ligaId', ligaId.toString());

    return this.http.get<Jugador[]>(`${environment.apiUrl}/api/jugadores-liga/liga`, { params });
  }

  obtenerJugadoresDeLiga(ligaId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${environment.apiUrl}/api/jugadores-liga/mercado`, {
      params: { ligaId }
    });
  }
}
