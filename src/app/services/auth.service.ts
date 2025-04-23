import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LigasService } from './ligas.service';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../models/usuario.model';
import { Liga } from '../models/liga.model';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  token?: string;
  dinero?: number;
  dineroPendiente?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/usuarios`;

  private userSubject = new BehaviorSubject<User | null>(null);  // ❗ Iniciamos vacío
  private usuarioCompletoSubject = new BehaviorSubject<Usuario | null>(null);
  usuarioCompleto$ = this.usuarioCompletoSubject.asObservable();

  private ligaIdSubject = new BehaviorSubject<number | null>(null);
  private ligaActual: Liga | null = null;

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService,
    private ligasService: LigasService
  ) {
    const id = this.getLigaId();
    this.ligaIdSubject.next(id);

    // 👇 Al cargar el servicio, intenta cargar el usuario completo
    const user = this.getUser();
    if (user?.id) {
      this.refreshUsuarioCompleto(); // 👈 Esto actualiza usuarioCompleto$
    }
  }


  private restaurarSesionDesdeStorage(): void {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const token = localStorage.getItem('token');

      if (user && token) {
        this.userSubject.next(user);
        this.refreshUsuarioCompleto(); // 🔄 Refresca datos extendidos (dinero, etc.)
      } else {
        this.logout(); // ❌ Limpia si hay datos inconsistentes
      }
    } catch (error) {
      console.error('❌ Error al restaurar sesión:', error);
      this.logout();
    }
  }

  login(credentials: any): Observable<{ user: User, token: string }> {
    return this.http.post<{ user: User, token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          response.user.token = response.token;
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          this.userSubject.next(response.user);
          this.refreshUsuarioCompleto();
        }
      })
    );
  }

  logout(): void {

    // 🧹 Limpieza de localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('ligaId');

    // 🧹 Limpieza de estado interno
    this.userSubject.next(null);
    this.usuarioCompletoSubject.next(null);
    this.setLiga(null);
    this.setLigaId(null);

    // (opcional) Limpieza de sessionStorage si lo has usado en algún componente
    sessionStorage.clear();
  }


  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, user);
  }


  refreshUsuarioCompleto(): void {
    const user = this.getUser();
    if (user?.id) {

      this.usuarioService.obtenerUsuarioCompleto(user.id).subscribe(usuario => {
        const actualizado = {
          ...user,
          dinero: usuario.dinero,
          dineroPendiente: usuario.dineroPendiente
        };

        // 👇 Consultar si el usuario está en una liga
        this.ligasService.obtenerLigaDelUsuario(user.id).subscribe(liga => {
          if (liga) {
            this.setLiga(liga);
            this.setLigaId(liga.id);
          } else {
            this.setLiga(null);
            this.setLigaId(null);
          }

          // 👉 Guardar todo en localStorage (excepto la liga como tal, solo ID)
          localStorage.setItem('user', JSON.stringify(actualizado));
          this.userSubject.next(actualizado); // Datos básicos
          this.usuarioCompletoSubject.next(usuario); // Objeto completo
        });
      });
    }
  }


  getUser(): User | null {
    return this.userSubject.value;
  }

  getUserId(): number | null {
    return this.getUser()?.id || null;
  }

  getUserRole(): string {
    return this.getUser()?.role || 'usuario';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  getUserObservable(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }) : new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  setLigaId(ligaId: number | null): void {
    if (ligaId !== null && ligaId !== undefined) {
      localStorage.setItem('ligaId', ligaId.toString());
    } else {
      localStorage.removeItem('ligaId');
    }
    this.ligaIdSubject.next(ligaId);
  }

  getLigaId(): number | null {
    const id = localStorage.getItem('ligaId');
    return id ? +id : null;
  }

  getLigaObservable(): Observable<number | null> {
    return this.ligaIdSubject.asObservable();
  }

  setLiga(liga: Liga | null): void {
    this.ligaActual = liga;
  }

  getLiga(): Liga | null {
    return this.ligaActual;
  }
}
