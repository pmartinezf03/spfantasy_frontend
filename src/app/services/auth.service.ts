import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private userSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  private ligaIdSubject = new BehaviorSubject<number | null>(null);


  constructor(private http: HttpClient) { }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, user);
  }

  login(credentials: any): Observable<{ user: User, token: string }> {
    return this.http.post<{ user: User, token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          response.user.token = response.token;
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          this.userSubject.next(response.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.userSubject.next(null);
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
    return !!this.getToken();
  }

  getUserObservable(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  private loadUserFromStorage(): User | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      console.log("📦 Usuario desde storage:", user);
      return user;
    } catch (error) {
      console.error('❌ Error al cargar usuario desde localStorage:', error);
      return null;
    }
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
  }

  getLigaId(): number | null {
    const id = localStorage.getItem('ligaId');
    return id ? +id : null;
  }


  getLigaObservable(): Observable<number | null> {
    return this.ligaIdSubject.asObservable();
  }

}
