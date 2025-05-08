import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of, catchError } from 'rxjs';
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
  vipHasta?: string | null; }


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
    this.restaurarSesionDesdeStorage(); // ✅ Carga usuario + refresh correcto

  }


  private restaurarSesionDesdeStorage(): void {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const token = localStorage.getItem('token');

      if (user && token) {
        this.userSubject.next(user);
        console.log('📥 usuarioCompleto$ emitió:', user);
        console.log("🧪 VIP hasta (inicio):", user.vipHasta); // 👈 AÑADE AQUÍ


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

          // Espera a que se refresque correctamente
          this.refreshUsuarioCompleto().subscribe(); // ← esto asegura que esté emitido
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


  refreshUsuarioCompleto(): Observable<Usuario | null> {
    const userId = this.getUserId();
    if (!userId) {
      console.warn('⚠️ No se pudo obtener el ID del usuario para refrescar.');
      return of(null);
    }

    return this.http.get<Usuario>(`${this.apiUrl}/${userId}`).pipe(
      tap((usuario) => {
        console.log('📥 usuarioCompleto$ emitió (desde refresh):', usuario);
        this.usuarioCompletoSubject.next(usuario);

        const currentUser = this.getUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            dinero: usuario.dinero,
            dineroPendiente: usuario.dineroPendiente,
            vipHasta: usuario.vipHasta || null
          };
          this.userSubject.next(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('🆕 Usuario con VIP actualizado en localStorage:', updatedUser);
        }

      }),
      catchError((error) => {
        console.error('❌ Error al refrescar el usuario:', error);
        return of(null);
      })
    );
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

  esVip(): boolean {
    const vipHasta = this.getUser()?.vipHasta;
    console.log('🧪 [esVip] vipHasta:', vipHasta);

    if (!vipHasta) return false;

    const ahora = new Date();
    const expiracion = new Date(vipHasta);
    const esVip = expiracion > ahora;

    console.log(`🔎 VIP válido? ${esVip} (ahora: ${ahora.toISOString()}, expira: ${expiracion.toISOString()})`);

    return esVip;
  }


  marcarComoVip(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/hacer-vip`, null, {
      headers: this.getAuthHeaders()
    });
  }



}
