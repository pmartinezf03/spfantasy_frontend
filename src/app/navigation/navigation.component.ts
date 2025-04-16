import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';
import { Router } from '@angular/router';
import { OfertasService } from '../services/ofertas.service';

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


  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    private ofertasService: OfertasService,

  ) { }
  usuarioId: number = 0;

  ngOnInit(): void {
    console.log('📍 NavigationComponent inicializado');
  
    this.authService.usuarioCompleto$.subscribe(usuario => {
      this.esperandoUsuario = false;

      const token = this.authService.getToken();
      this.isUserLoggedIn = !!usuario && !!token;
    
      this.usuarioLogueado = usuario?.username || null;
      this.usuarioDinero = usuario?.dinero ?? 0;
      this.usuarioDineroPendiente = usuario?.dineroPendiente ?? 0;
      this.datosUsuarioCargados = !!usuario;
  
      console.log('✅ Datos del usuario en navbar:');
      console.log('   👤 Username:', this.usuarioLogueado);
      console.log('   💰 Dinero:', this.usuarioDinero);
      console.log('   🔴 Pendiente:', this.usuarioDineroPendiente);
  
      this.construirMenu();
    });
  
    const user = this.authService.getUser();
    console.log('📦 Usuario desde AuthService.getUser():', user);
  
    if (user?.id) {
      console.log('🔄 Llamando a refreshUsuarioCompleto()...');
      this.authService.refreshUsuarioCompleto();
    }
  
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
  }
  
  



  construirMenu(): void {
    this.items = [
      {
        label: '🏠 Inicio',
        routerLink: '/'
      },
      {
        label: '📊 Estadísticas',
        routerLink: '/estadisticas-liga'
      },
      {
        label: '📰 Noticias',
        routerLink: '/noticias'
      },
      ...(this.isUserLoggedIn
        ? [
          { label: '🛒 Mercado', routerLink: '/mercado' },
          { label: '🏀 Mi Plantilla', routerLink: '/plantilla' },
          { label: '🏆 Ligas',routerLink: '/ligas'},
          { label: '💬 Chat', routerLink: '/chat' },
          {label: this.tieneOfertasNuevas ? '💰 Ofertas 🔴' : '💰 Ofertas',routerLink: '/ofertas'}
        ]
        : []),
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
  
    // 🧠 Asegurar limpieza del estado visual
    this.usuarioLogueado = null;
    this.usuarioDinero = 0;
    this.usuarioDineroPendiente = 0;
    this.isUserLoggedIn = false;
    this.datosUsuarioCargados = false;
  
    console.log('🔐 Usuario desconectado');
  
    // 🔄 Navegamos al login y reconstruimos el menú
    this.router.navigate(['/auth']).then(() => {
      this.construirMenu();
    });
  }
  
}
