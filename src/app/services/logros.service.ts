import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LogroDTO } from '../models/logro.model';



@Injectable({
  providedIn: 'root'
})
export class LogrosService {
private apiUrl = `${environment.apiUrl}/api/logros`;

  constructor(private http: HttpClient) { }

getTodosConEstado(usuarioId: number): Observable<LogroDTO[]> {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.get<LogroDTO[]>(
    `${this.apiUrl}/todos-con-estado/${usuarioId}`,
    { headers }
  );
}


}
