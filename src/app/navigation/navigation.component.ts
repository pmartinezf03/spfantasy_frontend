import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';
import { Router } from '@angular/router';
import { OfertasService } from '../services/ofertas.service';
import { Usuario } from '../models/usuario.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  items: MenuItem[] = [];
  isUserLoggedIn = false;
  usuarioLogueado: string | null = null;
  usuarioDinero = 0;
  tieneOfertasNuevas: boolean = false;
  usuarioDineroPendiente = 0;
  datosUsuarioCargados = false;
  esperandoUsuario = true;
  usuarioId: number = 0;
  usuarioAvatarUrl: string | null = null;
  avatarPreview: string | null = null;
  usuarioCompleto: Usuario | null = null;
  avatarBase64: string | null = null;
  menuAbierto: boolean = false;



  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    public router: Router,
    private ofertasService: OfertasService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    console.log('📍 NavigationComponent inicializado');

    // 🔁 Suscribirse al usuario completo
    this.authService.usuarioCompleto$.subscribe(usuario => {

      console.log('[usuarioCompleto$] Datos del usuario actual:', usuario);

      if (!usuario) {
        console.warn('⚠️ usuarioCompleto$ emitió null. No actualizo navbar.');
        return;
      }

      this.zone.run(() => {

        this.esperandoUsuario = false;

        const token = this.authService.getToken();
        this.isUserLoggedIn = !!usuario && !!token;

        this.usuarioLogueado = usuario.username;
        if (usuario.avatarUrl) {
          this.http.get(`${environment.apiUrl}${usuario.avatarUrl}`, { responseType: 'arraybuffer' })
            .subscribe((buffer: ArrayBuffer) => {
              const base64 = btoa(
                new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
              );
              this.avatarBase64 = `data:image/png;base64,${base64}`;
            }, error => {
              console.warn('⚠️ Avatar no disponible. Usando imagen por defecto.');
              this.avatarBase64 = null;
            });
        } else {
          this.avatarBase64 = null;
        }



        this.usuarioDinero = usuario.dinero ?? 0;
        this.usuarioDineroPendiente = usuario.dineroPendiente ?? 0;
        this.datosUsuarioCargados = true;

        console.log('✅ Datos del usuario en navbar:');
        console.log('   👤 Username:', this.usuarioLogueado);
        console.log('   💰 Dinero:', this.usuarioDinero);
        console.log('   🔴 Pendiente:', this.usuarioDineroPendiente);

        this.construirMenu();
        this.cdr.detectChanges(); // fuerza actualización visual
      });
    });

    // 🔔 Verificar si hay ofertas nuevas
    const userId = this.authService.getUserId();
    if (userId) {
      this.ofertasService.tieneOfertasNuevas(userId).subscribe(resp => {
        this.tieneOfertasNuevas = resp.tieneOfertasNuevas;
        console.log('📨 Ofertas nuevas detectadas:', this.tieneOfertasNuevas);
        this.construirMenu();
      });

      this.ofertasService.ofertasLeidas$.subscribe(leidas => {
        if (leidas) {
          this.tieneOfertasNuevas = false;
          console.log('🧹 Ofertas marcadas como leídas');
          this.construirMenu();
        }
      });
    }

    // 🔁 Refrescar usuario completo al iniciar, si no lo estaba
    const user = this.authService.getUser();

    if (user?.id) {
      this.authService.refreshUsuarioCompleto().subscribe(usuarioActualizado => {
        if (usuarioActualizado) {
          this.authService.getLigaObservable().subscribe(ligaId => {
            if (ligaId) {
              console.log('📌 Liga detectada al iniciar navbar:', ligaId);
              this.construirMenu();
              this.cdr.detectChanges();
            }
          });
        } else {
          console.warn('❌ No se pudo actualizar el usuario al iniciar');
        }
      });
    }
  }

  construirMenu(): void {
    this.items = [
      { label: '🏠 Inicio', routerLink: '/' },
      { label: '📊 Estadísticas', routerLink: '/estadisticas-liga' },
      { label: '📰 Noticias', routerLink: '/noticias' },
      ...(this.isUserLoggedIn
        ? [
          { label: '🛒 Mercado', routerLink: '/mercado' },
          { label: '🏀 Mi Plantilla', routerLink: '/plantilla' },
          { label: '🏆 Ligas', routerLink: '/ligas' },
          { label: '💬 Chat', routerLink: '/chat' },
          { label: this.tieneOfertasNuevas ? '💰 Ofertas 🔴' : '💰 Ofertas', routerLink: '/ofertas' },
          { label: '📈 Comparador', routerLink: '/comparador' }
        ]
        : [])
      ,
      {
        label: this.isUserLoggedIn ? '🚪 Cerrar Sesión' : '🔑 Iniciar sesión',
        command: () => {
          this.isUserLoggedIn ? this.logout() : this.router.navigate(['/auth']);
        }
      }
    ];
  }

  logout(): void {
    this.authService.logout();

    this.usuarioLogueado = null;
    this.usuarioDinero = 0;
    this.usuarioDineroPendiente = 0;
    this.isUserLoggedIn = false;
    this.datosUsuarioCargados = false;

    console.log('🔐 Usuario desconectado');

    this.router.navigate(['/auth']).then(() => {
      this.construirMenu();
    });
  }

  esVip(): boolean {
    const vipHasta = this.authService.getUser()?.vipHasta;
    return vipHasta ? new Date(vipHasta) > new Date() : false;
  }

  reiniciarSesion(): void {
    console.log('🧹 Reiniciando sesión: limpiando localStorage y forzando recarga');
    localStorage.clear(); // Limpia todo

    this.router.navigateByUrl('/auth').then(() => {
      setTimeout(() => {
        location.reload();
      }, 100);
    });
  }



}
