import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LogrosService } from '../services/logros.service';
import { LogroDTO } from '../models/logro.model';
import { UsuarioService } from '../services/usuario.service';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { TutorialService } from '../services/tutorial.service';
import { UsuarioNivelDTO } from '../models/usuario-nivel.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuarioLogueado: any = null;
  rachaLogin: number = 0;
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
  nivelActual: number = 1;

  nivelDTO: UsuarioNivelDTO | null = null;

  constructor(
    public authService: AuthService,
    private logrosService: LogrosService,
    private usuarioService: UsuarioService,
    private http: HttpClient,
    private tutorialService: TutorialService,
  ) { }

  ngOnInit(): void {
    this.authService.refreshUsuarioCompleto().subscribe(usuario => {
      if (!usuario) return;

      this.usuarioLogueado = usuario;
      this.rachaLogin = usuario.rachaLogin ?? 0;
      this.usuarioDinero = usuario.dinero ?? 0;
      this.dineroPendiente = usuario.dineroPendiente ?? 0;

      if (usuario.id) {
        this.usuarioService.obtenerNivelDetallado(usuario.id).subscribe({
          next: (nivelData) => {
            this.nivelDTO = nivelData;
            this.nivelActual = nivelData.nivel;
            this.experienciaPorcentaje = nivelData.porcentajeProgreso;
          },
          error: (err) => console.error('❌ Error al obtener nivel detallado:', err)
        });

        this.logrosService.getTodosConEstado(usuario.id).subscribe({
          next: logros => this.logros = logros,
          error: err => console.error('❌ Error cargando logros en perfil:', err)
        });
      }

      const yaVistoLocal = localStorage.getItem('tutorial_perfil') === 'true';
      const yaVistoBackend = usuario.tutorialVisto === true;
      if (!yaVistoLocal && !yaVistoBackend) {
        this.lanzarTutorialPerfil(usuario);
      }
    });
  }

  aumentarExperienciaYPersistir(puntos: number) {
    if (!this.usuarioLogueado?.id) return;

    this.usuarioService.aumentarExperiencia(this.usuarioLogueado.id, puntos).subscribe({
      next: () => {
        this.authService.refreshUsuarioCompleto().subscribe(usuario => {
          if (!usuario) return;
          this.usuarioLogueado = usuario;
          this.authService.usuarioCompletoSubject.next(usuario);

          this.usuarioService.obtenerNivelDetallado(usuario.id).subscribe({
            next: nivelData => {
              this.nivelDTO = nivelData;
              this.nivelActual = nivelData.nivel;
              this.experienciaPorcentaje = nivelData.porcentajeProgreso;
            },
            error: err => console.error('❌ Error al obtener nivel detallado tras aumentar experiencia:', err)
          });
        });
      },
      error: err => {
        console.error('❌ Error al aumentar experiencia:', err);
      }
    });
  }

  lanzarTutorialPerfil(usuario: any): void {
    this.tutorialService.cancelarTutorial();

    const pasos = [
      {
        id: 'avatar',
        attachTo: { element: '#perfil-avatar-preview', on: 'bottom' },
        title: '🧑 Personaliza tu Avatar',
        text: 'Puedes subir una imagen personalizada para destacar tu perfil.',
      },
      {
        id: 'info',
        attachTo: { element: '#perfil-info-basica', on: 'bottom' },
        title: '📄 Información de Usuario',
        text: 'Aquí puedes ver tu nombre, email y saldo actual.',
      },
      {
        id: 'logros',
        attachTo: { element: '#perfil-logros-card', on: 'top' },
        title: '🏆 Logros',
        text: 'Consulta los logros que has desbloqueado en tu aventura.',
      },
      {
        id: 'progreso',
        attachTo: { element: '#perfil-progreso-card', on: 'top' },
        title: '📈 Nivel y Experiencia',
        text: 'Observa tu progreso hacia el siguiente nivel aquí.',
      }
    ];

    this.tutorialService.lanzarTutorial(usuario, 'tutorial_perfil', pasos, () => {
      console.log('✅ Tutorial del perfil completado');
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
