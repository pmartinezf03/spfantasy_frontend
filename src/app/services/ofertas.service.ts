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
    return this.http.post<Oferta>(this.apiUrl, oferta, this.getAuthHeaders());
  }

  obtenerOfertasPorVendedor(vendedorId: number): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.apiUrl}/vendedor/${vendedorId}`, this.getAuthHeaders());
  }

  obtenerOfertasPorComprador(compradorId: number): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.apiUrl}/comprador/${compradorId}`, this.getAuthHeaders());
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
    if (!oferta.id) {
      console.error("❌ Error: La oferta no tiene un ID válido.");
      return new Observable<Oferta>();
    }

    const url = `${this.apiUrl}/contraoferta/${oferta.id}`;

    const payload = {
      montoOferta: oferta.montoOferta,  // ✅ Especificamos claramente el monto nuevo
      comprador: oferta.comprador,
      vendedor: oferta.vendedor,
      jugador: oferta.jugador,
      estado: 'CONTRAOFERTA'
    };

    console.log("📤 Payload enviado al backend (contraoferta):", payload);

    return this.http.post<Oferta>(url, payload, this.getAuthHeaders()); // ✅ Importante incluir headers aquí
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




}
