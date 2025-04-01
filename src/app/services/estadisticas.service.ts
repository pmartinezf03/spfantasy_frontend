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
    const usuarioId = this.authService.getUserId();

    if (!ligaId || !usuarioId) {
      console.warn("⚠ No hay ligaId o usuarioId disponibles para estadísticas.");
      return new Observable<Jugador[]>(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    const params = new HttpParams()
      .set('ligaId', ligaId.toString())
      .set('usuarioId', usuarioId.toString());

    return this.http.get<Jugador[]>(`${environment.apiUrl}/api/jugadores-liga/mis-jugadores`, { params });
  }
}
