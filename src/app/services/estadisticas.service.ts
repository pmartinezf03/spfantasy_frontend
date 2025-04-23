import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Jugador } from '../models/jugador.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  private apiUrl = `${environment.apiUrl}/api/estadisticas-liga`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getRanking(ligaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/ligas/${ligaId}/ranking`);
  }

  getTopT3(ligaId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/top-t3`, {
      params: new HttpParams().set('ligaId', ligaId)
    });
  }

  getTopFp(ligaId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/top-fp`, {
      params: new HttpParams().set('ligaId', ligaId)
    });
  }

  getTopRendimiento(ligaId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/top-rendimiento`, {
      params: new HttpParams().set('ligaId', ligaId)
    });
  }

  getTopPrecio(ligaId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/top-precio`, {
      params: new HttpParams().set('ligaId', ligaId)
    });
  }

  getTopMinutos(ligaId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/top-minutos`, {
      params: new HttpParams().set('ligaId', ligaId)
    });
  }

  getTopTl(ligaId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/top-tl`, {
      params: new HttpParams().set('ligaId', ligaId)
    });
  }

  getComparativa(ligaId: number, usuarioId: number): Observable<any> {
    const params = new HttpParams()
      .set('ligaId', ligaId)
      .set('usuarioId', usuarioId);
    return this.http.get<any>(`${this.apiUrl}/comparativa-usuario`, { params });
  }

  getJugadoresMasUsados(ligaId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/jugadores-mas-usados`, {
      params: new HttpParams().set('ligaId', ligaId)
    });
  }

  getJugadoresDeLiga(ligaId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${environment.apiUrl}/api/jugadores-liga/liga`, {
      params: new HttpParams().set('ligaId', ligaId)
    });
  }

}
