import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Jugador } from '../models/jugador.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private dineroUsuario: number = 0;

  private dineroSubject = new BehaviorSubject<number>(0);
  dineroUsuario$ = this.dineroSubject.asObservable();

  constructor(private http: HttpClient) { }

  obtenerUsuario(username: string, token: string): Observable<any> {
    if (!username || !token) {
      console.error('⚠ Error: Falta username o token para obtener usuario.');
      return throwError(() => new Error('No se puede obtener el usuario sin un username y token válido.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/${username}`, { headers }).pipe(
      tap(response => {
        console.log("📩 Datos recibidos del backend:", response);
      }),
      catchError(error => {
        console.error('❌ Error al obtener usuario:', error);
        return throwError(() => error);
      })
    );
  }

  comprarJugador(username: string, jugador: Jugador, token: string): Observable<any> {
    if (!username || !jugador?.id || !token) {
      console.error('⚠ Error: Falta username, ID de jugador o token para comprar.');
      return throwError(() => new Error('No se puede comprar el jugador sin datos válidos.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload = { id: jugador.id }; // ✅ solo ID necesario

    console.log("📦 Payload exacto enviado al backend:", payload);

    return this.http.post<any>(`${this.apiUrl}/${username}/comprar`, payload, { headers }).pipe(
      tap(response => {
        console.log("📤 Respuesta del backend al comprar:", response);
        this.actualizarDineroDesdeBackend(username, token).subscribe();
      }),
      catchError(error => {
        console.error('❌ Error al comprar jugador:', error);
        return throwError(() => error);
      })
    );
  }

  guardarPlantilla(username: string, plantillaData: { titulares: number[], suplentes: number[] }, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/${username}/guardar-plantilla`, plantillaData, { headers }).pipe(
      tap(response => {
        console.log("📤 Respuesta del backend al guardar la plantilla:", response);
      }),
      catchError(error => {
        console.error('❌ Error al guardar la plantilla:', error);
        return throwError(() => error);
      })
    );
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

    return this.http.post<any>(`${this.apiUrl}/${username}/vender`, jugadorPayload, { headers }).pipe(
      tap(response => {
        console.log("📤 Respuesta del backend al vender:", response);
        this.actualizarDineroDesdeBackend(username, token).subscribe();
      }),
      catchError((error) => {
        console.error('❌ Error al vender jugador:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerDineroUsuario(usuarioId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${usuarioId}/dinero`);
  }

  getUsuarios(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });

    return this.http.get<any[]>(`${this.apiUrl}`, { headers }).pipe(
      tap(response => console.log('👥 Usuarios cargados:', response)),
      catchError(error => {
        console.error('❌ Error al obtener usuarios:', error);
        return throwError(() => error);
      })
    );
  }

  setDinero(dinero: number): void {
    this.dineroUsuario = dinero;
  }

  getDinero(): number {
    return this.dineroUsuario;
  }

  actualizarDineroDesdeBackend(username: string, token: string): Observable<number> {
    return this.obtenerUsuario(username, token).pipe(
      tap(usuario => {
        this.setDinero(usuario.dinero);
        console.log('💰 Dinero actualizado desde backend:', usuario.dinero);
      }),
      map(usuario => usuario.dinero)
    );
  }
}
