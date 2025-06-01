import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodigoRecompensaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  verificarCodigo(codigo: string): Observable<any> {
    const token = localStorage.getItem('jwtToken');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/api/codigos/verificar/${codigo}`, { headers });
  }

  canjearCodigo(codigo: string): Observable<any> {
    const token = localStorage.getItem('jwtToken');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/api/codigos/canjear/${codigo}`, {}, { headers });
  }
}
