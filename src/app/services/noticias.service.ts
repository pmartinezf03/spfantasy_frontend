import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Noticia } from '../../app/models/noticia.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class NoticiasService {
  private apiUrl = `${environment.apiUrl}/noticias`;

  constructor(private http: HttpClient) {}

  getNoticias(): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(this.apiUrl);
  }

  crearNoticia(noticia: Noticia): Observable<Noticia> {
    return this.http.post<Noticia>(this.apiUrl, noticia);
  }
}
