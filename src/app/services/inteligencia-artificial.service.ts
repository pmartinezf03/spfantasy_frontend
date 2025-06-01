import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ChatResponse {
  // Aquí debe coincidir con lo que devuelve tu backend,
  // si el backend devuelve solo un string, pon string directamente
  // o si devuelve { respuesta: string }, usa eso.
  respuesta: string;
}

@Injectable({
  providedIn: 'root'
})
export class InteligenciaArtificialService {
  private apiUrl = '/api/chatbot';

  constructor(private http: HttpClient) {}

  preguntar(username: string, pregunta: string): Observable<ChatResponse> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Construimos un objeto con la propiedad "pregunta"
    const body = { pregunta };

    return this.http.post<ChatResponse>(
      `${this.apiUrl}/${username}`,
      body,
      { headers }
    );
  }
}
