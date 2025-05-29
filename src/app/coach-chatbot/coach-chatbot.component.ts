import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-coach-chatbot',
  templateUrl: './coach-chatbot.component.html',
  styleUrls: ['./coach-chatbot.component.css']
})
export class CoachChatbotComponent implements OnInit {
  mensajes: string[] = [];
  mostrando = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const usuario = this.authService.getUser();
    const token = this.authService.getToken();

    if (usuario?.username && token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const url = `${environment.apiUrl}/api/usuarios/${usuario.username}/consejos`;
      console.log("🌐 Llamando a:", url); // 👈 Confirmación

      this.http.get<string[]>(url, { headers }).subscribe({
        next: (res) => {
          this.mensajes = res;
          console.log("✅ Consejos del Coach:", res);
        },
        error: (err) => {
          console.error("❌ Error al obtener consejos del Coach:", err);
          this.mensajes = ["⚠️ No se pudieron cargar los consejos del coach."];
        }
      });
    }
  }


  toggleChat(): void {
    this.mostrando = !this.mostrando;
  }
}
