import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';
import { Router } from '@angular/router';
import { OfertasService } from '../services/ofertas.service';
import { Usuario } from '../models/usuario.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TutorialService } from '../services/tutorial.service';

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
    private http: HttpClient,
    private tutorialService: TutorialService,
  ) { }

  ngOnInit(): void {

    //  Suscribirse al usuario completo
    this.authService.usuarioCompleto$.subscribe(usuario => {


      if (!usuario) {
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
              console.warn('️ Avatar no disponible. Usando imagen por defecto.');
              this.avatarBase64 = null;
            });
        } else {
          this.avatarBase64 = null;
        }



        this.usuarioDinero = usuario.dinero ?? 0;
        this.usuarioDineroPendiente = usuario.dineroPendiente ?? 0;
        this.datosUsuarioCargados = true;



        this.construirMenu();
        this.cdr.detectChanges(); // fuerza actualización visual
      });
    });

    //  Verificar si hay ofertas nuevas
    const userId = this.authService.getUserId();
    if (userId) {
      this.ofertasService.tieneOfertasNuevas(userId).subscribe(resp => {
        this.tieneOfertasNuevas = resp.tieneOfertasNuevas;
        
        this.construirMenu();
      });

      this.ofertasService.ofertasLeidas$.subscribe(leidas => {
        if (leidas) {
          this.tieneOfertasNuevas = false;
          
          this.construirMenu();
        }
      });
    }

    //  Refrescar usuario completo al iniciar, si no lo estaba
    const user = this.authService.getUser();

    if (user?.id) {
      this.authService.refreshUsuarioCompleto().subscribe(usuarioActualizado => {
        if (usuarioActualizado) {
          this.authService.getLigaObservable().subscribe(ligaId => {
            if (ligaId) {
              this.construirMenu();
              this.cdr.detectChanges();
            }
          });
        } else {
        }
      });
    }
    setTimeout(() => {
      const yaVisto = localStorage.getItem('tutorial_navbar') === 'true';
      const primerClickKey = 'tutorial_navbar_click_detected';

      if (!yaVisto && !localStorage.getItem(primerClickKey)) {
        const enlaces = document.querySelectorAll('a[routerLink]');
        const listener = (e: any) => {
          localStorage.setItem(primerClickKey, 'true');
          enlaces.forEach(enlace => enlace.removeEventListener('click', listener));
          this.onClickNavbarLink();
        };
        enlaces.forEach(enlace => enlace.addEventListener('click', listener));
      }
    }, 500);


  }

  construirMenu(): void {
    this.items = [
      { label: ' Inicio', routerLink: '/' },
      { label: ' Estadísticas', routerLink: '/estadisticas-liga' },
      { label: ' Noticias', routerLink: '/noticias' },
      ...(this.isUserLoggedIn
        ? [
          { label: ' Mercado', routerLink: '/mercado' },
          { label: ' Mi Plantilla', routerLink: '/plantilla' },
          { label: ' Ligas', routerLink: '/ligas' },
          { label: ' Chat', routerLink: '/chat' },
          { label: this.tieneOfertasNuevas ? ' Ofertas ' : ' Ofertas', routerLink: '/ofertas' },
          { label: ' Comparador', routerLink: '/comparador' }
        ]
        : [])
      ,
      {
        label: this.isUserLoggedIn ? ' Cerrar Sesión' : ' Iniciar sesión',
        command: () => {
          this.isUserLoggedIn ? this.logout() : this.router.navigate(['/auth']);
        }
      }
    ];
  }

  onClickNavbarLink(): void {
    this.tutorialService.cancelarTutorial();
    const usuario = this.authService.getUser();
    if (!usuario || localStorage.getItem('tutorial_navbar') === 'true') return;

        if ((window as any).Shepherd?.activeTour) {
      console.warn(' Otro tutorial ya está activo. Se cancela el del navbar.');
      return;
    }

    const pasos = [
      {
        id: 'logo',
        attachTo: { element: '.logo-navbar', on: 'bottom' },
        title: ' Bienvenido a SP Fantasy',
        text: 'Este es el logo oficial de la aplicación.',
      },
      {
        id: 'inicio',
        attachTo: { element: '.menu-item-inicio', on: 'bottom' },
        title: ' Inicio',
        text: 'Desde aquí puedes volver a la página principal.',
      },
      {
        id: 'plantilla',
        attachTo: { element: '.menu-item-plantilla', on: 'bottom' },
        title: ' Mi Plantilla',
        text: 'Aquí puedes ver y editar tu plantilla.',
      },
      {
        id: 'ofertas',
        attachTo: { element: '.menu-item-ofertas', on: 'bottom' },
        title: ' Ofertas',
        text: 'Accede a tus ofertas desde aquí.',
      },
      {
        id: 'perfil',
        attachTo: { element: '#nav-avatar', on: 'left' },
        title: ' Perfil',
        text: 'Tu avatar y opciones de usuario están aquí.',
      }
    ];

    this.tutorialService.lanzarTutorial(usuario, 'tutorial_navbar', pasos, () => {
      
    });
  }


  logout(): void {
    
    this.authService.logout();

    this.reiniciarSesion();
  }


  esVip(): boolean {
    const vipHasta = this.authService.getUser()?.vipHasta;
    return vipHasta ? new Date(vipHasta) > new Date() : false;
  }

  reiniciarSesion(): void {
    
    localStorage.clear();

    this.router.navigateByUrl('/auth').then(() => {
      setTimeout(() => {
        location.reload();
      }, 100);
    });
  }





}
