import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-inteli-artif',
  templateUrl: './inteli-artif.component.html',
  styleUrls: ['./inteli-artif.component.css']
})
export class InteliArtifComponent implements OnInit {
  mensajes: { texto: string, desdeUsuario: boolean }[] = [];
  entradaMensaje: string = '';
  mostrando = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }



  abrirChat() {
    this.mostrando = true;
  }

  cerrarChat() {
    this.mostrando = false;
  }

  enviarMensaje() {
    if (!this.entradaMensaje.trim()) return;

    // Añadir mensaje del usuario al chat
    this.mensajes.push({ texto: this.entradaMensaje, desdeUsuario: true });

    const usuario = this.authService.getUser();
    const token = this.authService.getToken();

    if (!usuario || !token) {
      this.mensajes.push({ texto: 'Debes estar logueado para usar el chatbot.', desdeUsuario: false });
      this.entradaMensaje = '';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload = { pregunta: this.entradaMensaje };

    this.http.post<{ respuesta: string }>(
      `${environment.apiUrl}/api/chatbot/${usuario.username}`,
      payload,
      { headers }
    ).subscribe({
      next: (res) => {
        this.mensajes.push({ texto: res.respuesta, desdeUsuario: false });
        this.entradaMensaje = '';
      },
      error: (err) => {
        this.mensajes.push({ texto: 'Error al comunicarse con el chatbot.', desdeUsuario: false });
        this.entradaMensaje = '';
      }
    });
  }
}
