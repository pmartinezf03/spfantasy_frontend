import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Transaccion } from '../models/transaccion.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {
  private apiUrl = `${environment.apiUrl}/api/transacciones`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  obtenerHistorial(usuarioId: number, ligaId: number): Observable<Transaccion[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    return this.http.get<Transaccion[]>(`${this.apiUrl}/${usuarioId}/${ligaId}`, { headers });
  }

  obtenerHistorialLiga(ligaId: number): Observable<Transaccion[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    return this.http.get<Transaccion[]>(`${this.apiUrl}/liga/${ligaId}`, { headers });
  }
}
