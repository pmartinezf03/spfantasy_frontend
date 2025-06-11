import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-canjear-codigo',
  templateUrl: './canjear-codigo.component.html',
  styleUrls: ['./canjear-codigo.component.css']
})
export class CanjearCodigoComponent {
  codigo = '';
  mensaje = '';
  resultado: any = null;

  constructor(private http: HttpClient) { }

  canjear() {
    this.mensaje = '';
    this.resultado = null;

    if (!this.codigo || this.codigo.trim() === '') {
      this.mensaje = '❌ Debes introducir un código.';
      return;
    }

    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(`${environment.apiUrl}/api/codigos/verificar/${this.codigo}`, { headers })
      .subscribe({
        next: (res) => {
          if (!res) {
            this.mensaje = '❌ Código no válido.';
          } else if (res.usado) {
            this.mensaje = '️ Este código ya fue usado.';
          } else {
            this.resultado = res;
            this.http.post<any>(`${environment.apiUrl}/api/codigos/canjear/${this.codigo}`, {}, { headers })
              .subscribe({
                next: (_) => {
                  this.mensaje = `🎁 Has canjeado: ${res.producto_id?.[1] || 'Recompensa desconocida'}`;
                },
                error: (_) => {
                  this.mensaje = '❌ No se pudo marcar como usado. Intenta más tarde.';
                }
              });

          }
        },
        error: (err) => {
          console.error("❌ Error:", err);

          const esHtml = typeof err.error === 'string' && err.error.includes('<!DOCTYPE html>');
          const esErrorServidor = err.status >= 500;

          if (!err.status) {
            this.mensaje = '❌ No se pudo conectar con el servidor.';
          } else if (esHtml || err.status === 404) {
            this.mensaje = '❌ Código no válido.';
          } else if (esErrorServidor) {
            this.mensaje = '❌ Error del servidor. Intenta más tarde.';
          } else if (err?.error?.error) {
            this.mensaje = '❌ ' + err.error.error;
          } else {
            this.mensaje = '❌ Error inesperado al verificar el código.';
          }
        }





      });
  }
}
