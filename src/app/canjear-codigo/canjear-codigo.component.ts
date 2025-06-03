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

  constructor(private http: HttpClient) {}

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
            this.mensaje = '⚠️ Este código ya fue usado.';
          } else {
            this.resultado = res;
            this.mensaje = '✅ Código válido. ¡Recompensa disponible!';
            // Aquí podrías hacer la llamada a canjear si quieres
          }
        },
        error: (err) => {
          console.error("❌ Error:", err);
          this.mensaje = err?.error?.error || '❌ Error al verificar el código.';
        }
      });
  }
}
