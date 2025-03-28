import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Noticia } from '../../app/models/noticia.model';


@Injectable({
  providedIn: 'root'
})
export class NoticiasService {
  private apiUrl = 'http://localhost:8080/noticias';

  constructor(private http: HttpClient) {}

  getNoticias(): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(this.apiUrl);
  }

  crearNoticia(noticia: Noticia): Observable<Noticia> {
    return this.http.post<Noticia>(this.apiUrl, noticia);
  }
}
