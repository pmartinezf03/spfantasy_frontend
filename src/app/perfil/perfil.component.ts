import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LogrosService } from '../services/logros.service';
import { LogroDTO } from '../models/logro.model';
import { UsuarioService } from '../services/usuario.service';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuarioLogueado: any = null;
  usuarioDinero: number = 0;
  dineroPendiente: number = 0;

  logros: LogroDTO[] = [];
  logroSeleccionado: LogroDTO | null = null;
  avatarFile: File | null = null;
  usuarioAvatarUrl: string | null = null;
  avatarPreview: string | null = null;
  avatarSeleccionado: File | null = null;
  apiUrl = environment.apiUrl;

  experienciaPorcentaje: number = 0;

  chartData: any;
  chartOptions: any;

  constructor(
    public authService: AuthService,
    private logrosService: LogrosService,
    private usuarioService: UsuarioService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.authService.refreshUsuarioCompleto().subscribe(usuario => {
      if (!usuario) return;

      this.usuarioLogueado = usuario;
      this.usuarioDinero = usuario.dinero ?? 0;
      this.dineroPendiente = usuario.dineroPendiente ?? 0;

      this.experienciaPorcentaje = Math.min(100, usuario.experiencia || 0);

      // 🎯 Datos para el gráfico radar
      this.chartData = {
        labels: ['Compras', 'Ventas', 'Puntos', 'Logins', 'Sesiones'],
        datasets: [
          {
            label: 'Mi Actividad',
            data: [
              usuario.compras ?? 0,
              usuario.ventas ?? 0,
              usuario.puntos ?? 0,
              usuario.logins ?? 0,
              usuario.sesiones ?? 0
            ],
            fill: true,
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: '#facc15',
            pointBackgroundColor: '#facc15',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#facc15'
          }
        ]
      };

      this.chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#facc15'
            }
          }
        },
        scales: {
          r: {
            angleLines: { color: '#334155' },
            grid: { color: '#334155' },
            pointLabels: { color: '#facc15' },
            ticks: {
              color: '#e2e8f0',
              backdropColor: 'transparent'
            }
          }
        }
      };

      // 🖼️ Cargar avatar
      if (usuario.avatarUrl?.startsWith('/')) {
        this.http.get(`${environment.apiUrl}${usuario.avatarUrl}`, { responseType: 'arraybuffer' })
          .subscribe(buffer => {
            const base64 = btoa(
              new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            this.usuarioAvatarUrl = `data:image/png;base64,${base64}`;
          }, () => {
            this.usuarioAvatarUrl = 'assets/default-avatar.png';
          });
      }

      // 🏆 Cargar logros
      if (usuario.id) {
        this.logrosService.getTodosConEstado(usuario.id).subscribe({
          next: logros => this.logros = logros,
          error: err => console.error('❌ Error cargando logros en perfil:', err)
        });
      }
    });
  }

  mostrarDetalle(logro: LogroDTO): void {
    if (logro.desbloqueado) {
      this.logroSeleccionado = logro;
    }
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      this.avatarSeleccionado = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const preview = e.target.result;
        this.avatarPreview = preview;
        this.usuarioAvatarUrl = preview;
      };
      reader.readAsDataURL(file);
    }
  }

  aplicarNuevoAvatar() {
    if (!this.avatarSeleccionado) return;

    const formData = new FormData();
    formData.append('avatar', this.avatarSeleccionado);

    const userId = this.authService.getUserId();
    const token = this.authService.getToken();
    if (!userId || !token) return;

    this.http.post(`${this.apiUrl}/api/usuarios/${userId}/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'text'
    }).subscribe({
      next: res => {
        console.log('✅ Avatar actualizado correctamente:', res);

        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          this.usuarioAvatarUrl = base64;
          this.authService.setAvatarUrl(base64);

          const userActualizado = {
            ...this.usuarioLogueado,
            avatarBase64: base64
          };
          this.authService.usuarioCompletoSubject.next(userActualizado);
        };

        if (this.avatarSeleccionado instanceof File) {
          reader.readAsDataURL(this.avatarSeleccionado);
        }
      },
      error: err => {
        console.error('❌ Error al subir avatar:', err);
      }
    });
  }
}
