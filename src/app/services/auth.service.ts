import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of, catchError, switchMap, map } from 'rxjs';
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
  vipHasta?: string | null;
  avatarUrl?: string | null;
  compras?: number;
  ventas?: number;
  puntos?: number;
  logins?: number;
  sesiones?: number;
  experiencia?: number;
  diasActivo?: number;
  rachaLogin?: number;
  partidasJugadas?: number;
  nivel?: number;
}




@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public apiUrl = `${environment.apiUrl}/api/usuarios`;

  private userSubject = new BehaviorSubject<User | null>(null);
  public usuarioCompletoSubject = new BehaviorSubject<Usuario | null>(null);
  public usuarioCompleto: Usuario | null = null;
  private usuarioAutenticado: Usuario | null = null;

  usuarioCompleto$ = this.usuarioCompletoSubject.asObservable();

  private ligaIdSubject = new BehaviorSubject<number | null>(null);
  private ligaActual: Liga | null = null;

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService,
    private ligasService: LigasService,

  ) {
    const id = this.getLigaId();
    this.ligaIdSubject.next(id);
    this.cargarSesionDesdeStorage();

  }


  private restaurarSesionDesdeStorage(): void {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const token = localStorage.getItem('token');

      if (user && token) {
        this.userSubject.next(user);
        
        //  AÑADE AQUÍ


        this.refreshUsuarioCompleto(); //  Refresca datos extendidos (dinero, etc.)
        this.registrarSesion(user.id); // sesion diaria
        this.registrarLogin(user.id);  // login real

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

          const userId = response.user.id;

          // ✅ Llamadas al backend para registrar actividad
          this.registrarLogin(userId);     // Suma login y actualiza racha
          this.registrarSesion(userId);    // Suma sesiones

          //  Refrescar datos completos del usuario
          this.refreshUsuarioCompleto().subscribe();
        }
      })
    );
  }

  cargarSesionDesdeStorage(): void {
    const data = localStorage.getItem('usuario');
    if (data) {
      try {
        this.usuarioAutenticado = JSON.parse(data);
      } catch (e) {
        console.error('❌ Error al cargar usuario desde localStorage. Reiniciando...');
        this.logout(); // limpia si hay error
      }
    }
  }

  logout(): void {

    //  Limpieza de localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('ligaId');

    //  Limpieza de estado interno
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
      console.warn('️ No se pudo obtener el ID del usuario para refrescar.');
      return of(null);
    }

    // Petición para obtener usuario completo (experiencia incluida)
    const usuario$ = this.http.get<Usuario>(`${this.apiUrl}/${userId}`);
    // Petición para obtener el DTO con experiencia + nivel + porcentaje
    const nivelDetallado$ = this.usuarioService.obtenerNivelDetallado(userId);

    return usuario$.pipe(
      switchMap(usuario =>
        nivelDetallado$.pipe(
          map(dto => {
            usuario.nivel = dto.nivel;
            usuario.experiencia = dto.experienciaTotal;
            // Si quieres guardar también porcentaje en memoria temporal
            (usuario as any).porcentajeProgreso = dto.porcentajeProgreso;
            return usuario;
          })
        )
      ),
      tap((usuario) => {
        
        this.usuarioCompleto = usuario;
        this.usuarioCompletoSubject.next(usuario);

        const currentUser = this.getUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            dinero: usuario.dinero,
            dineroPendiente: usuario.dineroPendiente,
            vipHasta: usuario.vipHasta || null,
            avatarUrl: usuario.avatarUrl || null,
            compras: usuario.compras ?? 0,
            ventas: usuario.ventas ?? 0,
            puntos: usuario.puntos ?? 0,
            logins: usuario.logins ?? 0,
            sesiones: usuario.sesiones ?? 0,
            experiencia: usuario.experiencia ?? 0,
            diasActivo: usuario.diasActivo ?? 0,
            rachaLogin: usuario.rachaLogin ?? 0,
            partidasJugadas: usuario.partidasJugadas ?? 0,
            nivel: usuario.nivel ?? 1
          };

          this.userSubject.next(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
        }
      }),
      catchError((error) => {
        console.error('❌ Error al refrescar el usuario:', error);
        return of(null);
      })
    );
  }



  getUser(): User | null {
    let user = this.userSubject.value;

    if (!user) {
      const stored = localStorage.getItem('user');
      if (stored) {
        user = JSON.parse(stored);
        this.userSubject.next(user); //  Lo restauramos
      }
    }

    return user;
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
    

    if (!vipHasta) return false;

    const ahora = new Date();
    const expiracion = new Date(vipHasta);
    const esVip = expiracion > ahora;

    

    return esVip;
  }


  marcarComoVip(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/hacer-vip`, null, {
      headers: this.getAuthHeaders()
    });
  }

  setAvatarUrl(url: string): void {
    const baseUrl = environment.apiUrl;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    const user = this.getUser();
    const usuarioCompleto = this.usuarioCompletoSubject.value;

    if (user) {
      const updatedUser = {
        ...user,
        avatarUrl: fullUrl
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.userSubject.next(updatedUser);
    }

    if (usuarioCompleto) {
      const actualizado = { ...usuarioCompleto, avatarUrl: fullUrl };
      this.usuarioCompletoSubject.next(actualizado);
    }
  }

  //  Estadísticas de usuario
  registrarLogin(userId: number): void {
    this.http.put(`${this.apiUrl}/estadisticas/${userId}/login`, null, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => console.log('✅ Login registrado'),
      error: err => console.error('❌ Error al registrar login:', err)
    });
  }

  registrarSesion(userId: number): void {
    this.http.put(`${this.apiUrl}/estadisticas/${userId}/sesion`, null, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => console.log('✅ Sesión registrada'),
      error: err => console.error('❌ Error al registrar sesión:', err)
    });
  }

  registrarCompra(userId: number): void {
    this.http.put(`${this.apiUrl}/estadisticas/${userId}/compra`, null, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => console.log('✅ Compra registrada'),
      error: err => console.error('❌ Error al registrar compra:', err)
    });
  }

  registrarVenta(userId: number): void {
    this.http.put(`${this.apiUrl}/estadisticas/${userId}/venta`, null, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => console.log('✅ Venta registrada'),
      error: err => console.error('❌ Error al registrar venta:', err)
    });
  }

  registrarPartida(userId: number): void {
    this.http.put(`${this.apiUrl}/estadisticas/${userId}/partida`, null, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => console.log('✅ Partida registrada'),
      error: err => console.error('❌ Error al registrar partida:', err)
    });
  }


  getUsuario(): Usuario | null {
    if (!this.usuarioCompleto) {
      const data = localStorage.getItem('usuario');
      if (data) {
        try {
          this.usuarioCompleto = JSON.parse(data);
        } catch (e) {
          console.error('❌ Usuario corrupto en localStorage. Cerrando sesión.');
          this.logout();
          return null;
        }
      }
    }
    return this.usuarioCompleto;
  }

  public initSesionDesdeStorage(): void {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const token = localStorage.getItem('token');

      if (user && token) {
        this.userSubject.next(user);
        this.refreshUsuarioCompleto().subscribe(); // ahora sí, ya es seguro
        this.registrarSesion(user.id);
        this.registrarLogin(user.id);
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('❌ Error al restaurar sesión:', error);
      this.logout();
    }
  }

  public isAuthenticated$: Observable<boolean> = this.userSubject.asObservable().pipe(
    map(user => !!user)
  );










}
