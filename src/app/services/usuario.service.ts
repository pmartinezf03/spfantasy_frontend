import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Jugador } from '../models/jugador.model';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';
import { UsuarioNivelDTO } from '../models/usuario-nivel.model';

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

  venderJugadorDeLiga(username: string, jugadorLigaId: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(
      `${this.apiUrl}/${username}/vender-jugador-liga/${jugadorLigaId}`,
      {},
      {
        headers,
        responseType: 'text' as 'json'  // <- ⚠️ Esto arregla el error del JSON parse
      }
    );
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


  obtenerPuntosSemanales(username: string, token: string): Observable<{ [jugadorId: number]: string }> {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<{ [jugadorId: number]: string }>(`${environment.apiUrl}/api/usuarios/${username}/puntos-semana`, { headers });
  }

  subirAvatar(usuarioId: number, formData: FormData): Observable<string> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    });

    return this.http.post(`${this.apiUrl}/${usuarioId}/avatar`, formData, {
      headers,
      responseType: 'text'
    });


  }

  aumentarExperiencia(usuarioId: number, puntos: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${usuarioId}/experiencia`, { puntos });
  }


  marcarTutorialVisto(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/tutorial/visto`, {});
  }


  obtenerNivel(usuarioId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${usuarioId}/nivel`);
  }

  obtenerExperiencia(usuarioId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${usuarioId}/experiencia`);
  }

  obtenerNivelDetallado(id: number): Observable<UsuarioNivelDTO> {
    return this.http.get<UsuarioNivelDTO>(`${this.apiUrl}/${id}/nivel-detallado`);
  }




}
