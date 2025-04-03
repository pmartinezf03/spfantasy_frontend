import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Oferta } from '../models/oferta.model';
import { AuthService } from '../services/auth.service';  // ✅ Importamos AuthService
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfertasService {
  private apiUrl = `${environment.apiUrl}/api/ofertas`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders() {
    return { headers: this.authService.getAuthHeaders() };
  }

  crearOferta(oferta: Oferta): Observable<Oferta> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<Oferta>(`${this.apiUrl}`, oferta, { headers });
  }
  
  obtenerOfertasPorVendedor(vendedorId: number, ligaId: number): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.apiUrl}/vendedor/${vendedorId}?ligaId=${ligaId}`, this.getAuthHeaders());
  }

  obtenerOfertasPorComprador(compradorId: number, ligaId: number): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.apiUrl}/comprador/${compradorId}?ligaId=${ligaId}`, this.getAuthHeaders());
  }


  actualizarOferta(id: number, oferta: Oferta): Observable<Oferta> {
    return this.http.put<Oferta>(`${this.apiUrl}/${id}`, oferta, this.getAuthHeaders());
  }

  retirarOferta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/retirar`, this.getAuthHeaders());
  }

  aceptarOferta(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/aceptar/${id}`, {}, this.getAuthHeaders());
  }

  rechazarOferta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rechazar/${id}`, this.getAuthHeaders());
  }

  hacerContraoferta(oferta: Oferta): Observable<Oferta> {
    const url = `${this.apiUrl}/contraoferta/${oferta.id}`;
    const payload = {
      montoOferta: oferta.montoOferta,
      comprador: oferta.comprador,
      vendedor: oferta.vendedor,
      jugador: oferta.jugador,
      estado: 'CONTRAOFERTA',
      liga: oferta.liga
    };
    return this.http.post<Oferta>(url, payload, this.getAuthHeaders());
  }


  tieneOfertasNuevas(vendedorId: number): Observable<{ tieneOfertasNuevas: boolean }> {
    const url = `${this.apiUrl}/nuevas/${vendedorId}`;
    return this.http.get<{ tieneOfertasNuevas: boolean }>(url, this.getAuthHeaders());
  }

  marcarOfertasComoLeidas(usuarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/marcar-leidas/${usuarioId}`, {}, this.getAuthHeaders());
  }



  // 🔴 Subject para notificar al NavigationComponent
  private ofertasLeidasSubject = new BehaviorSubject<boolean>(false);
  ofertasLeidas$ = this.ofertasLeidasSubject.asObservable();

  notificarLeido(): void {
    this.ofertasLeidasSubject.next(true); // Emitimos que ya se leyeron
  }


  private datosUsuarioSubject = new BehaviorSubject<Usuario | null>(null);
  datosUsuario$ = this.datosUsuarioSubject.asObservable();


  obtenerUltimaOferta(usuarioId: number, jugadorId: number) {
    const ligaId = this.authService.getLigaId(); // o pásalo como argumento si no tienes acceso
    return this.http.get<Oferta>(`${this.apiUrl}/ultima-oferta/${usuarioId}/${jugadorId}?ligaId=${ligaId}`);
  }
  

}
