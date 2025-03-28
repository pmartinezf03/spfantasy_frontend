import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jugador } from '../../models/jugador.model';

@Injectable({
  providedIn: 'root'
})
export class MiPlantillaService {
  private apiUrl = 'http://localhost:8080/jugadores'; // Ajusta la URL del backend

  constructor(private http: HttpClient) {}

  // Método para obtener los jugadores desde el backend
  getJugadores(headers: HttpHeaders): Observable<Jugador[]> {
    return this.http.get<Jugador[]>('http://localhost:8080/jugadores', { headers });
  }

}
