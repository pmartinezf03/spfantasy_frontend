import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../auth/services/auth.service';
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


  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    private ofertasService: OfertasService,

  ) { }
  usuarioId: number = 0;
  ngOnInit(): void {
    this.authService.getUserObservable().subscribe(user => {
      this.isUserLoggedIn = !!user;
      this.usuarioLogueado = user?.username || null;

      if (this.isUserLoggedIn && user?.id) {
        this.usuarioService.obtenerDineroUsuario(user.id).subscribe(dinero => {
          this.usuarioDinero = dinero;
        });

        this.ofertasService.tieneOfertasNuevas(user.id).subscribe(resp => {
          this.tieneOfertasNuevas = resp.tieneOfertasNuevas;
          this.construirMenu();
        });

        // ✅ Escuchamos cuando el usuario entra a la pestaña y las ofertas se marcan como leídas
        this.ofertasService.ofertasLeidas$.subscribe(leidas => {
          if (leidas) {
            console.log("🔴 Ofertas leídas, ocultando punto rojo");
            this.tieneOfertasNuevas = false;
            this.construirMenu();
          }
        });
      } else {
        this.construirMenu();
      }
    });
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
          { label: '💬 Chat', routerLink: '/chat' },
          {
            label: this.tieneOfertasNuevas ? '💰 Ofertas 🔴' : '💰 Ofertas',
            routerLink: '/ofertas'
          }
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
    this.usuarioLogueado = null;
    this.usuarioDinero = 0;
    this.isUserLoggedIn = false;
    this.router.navigate(['/auth']);
    this.construirMenu();
  }
}
