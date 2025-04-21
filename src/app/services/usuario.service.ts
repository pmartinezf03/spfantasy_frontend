import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Jugador } from '../models/jugador.model';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient) { }

  obtenerUsuario(username: string, token: string): Observable<any> {
    if (!username || !token) {
      console.error('⚠ Error: Falta username o token para obtener usuario.');
      return throwError(() => new Error('No se puede obtener el usuario sin un username y token válido.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/by-username/${username}`, { headers }).pipe(
      tap(response => console.log("📩 Datos recibidos del backend:", response)),
      catchError(error => {
        console.error('❌ Error al obtener usuario:', error);
        return throwError(() => error);
      })
    );
  }

  comprarJugador(username: string, jugador: Jugador, token: string): Observable<any> {
    if (!username || !jugador?.id || !token) {
      return throwError(() => new Error('No se puede comprar el jugador sin datos válidos.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload = { id: jugador.id };

    return this.http.post<any>(`${this.apiUrl}/${username}/comprar`, payload, { headers });
  }

  comprarJugadorDeLiga(username: string, jugadorLigaId: number, ligaId: number, token: string): Observable<any> {
    if (!username || !jugadorLigaId || !ligaId || !token) {
      return throwError(() => new Error('❌ Faltan datos para comprar jugador desde la liga.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    const url = `${this.apiUrl}/${username}/comprar-liga?jugadorLigaId=${jugadorLigaId}&ligaId=${ligaId}`;
    return this.http.post<any>(url, {}, { headers }).pipe(
      tap(response => console.log('✅ Compra desde liga realizada:', response)),
      catchError(error => {
        console.error('❌ Error al comprar desde liga:', error);
        return throwError(() => error);
      })
    );
  }
  


  guardarPlantilla(username: string, plantillaData: { titulares: number[], suplentes: number[] }, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/${username}/guardar-plantilla`, plantillaData, { headers });
  }

  venderJugador(username: string, jugador: Jugador, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const jugadorPayload = {
      id: jugador.id,
      nombre: jugador.nombre,
      precioVenta: jugador.precioVenta
    };

    return this.http.post<any>(`${this.apiUrl}/${username}/vender`, jugadorPayload, { headers });
  }

  obtenerUsuarioCompleto(usuarioId: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${usuarioId}`);
  }

  obtenerUsuarios(): Observable<Usuario[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });

    return this.http.get<Usuario[]>(`${this.apiUrl}`, { headers }).pipe(
      tap(usuarios => console.log('📥 Usuarios cargados desde el backend:', usuarios)),
      catchError(error => {
        console.error('❌ Error al obtener usuarios:', error);
        return throwError(() => error);
      })
    );
  }

}
