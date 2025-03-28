import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../auth/services/auth.service';
import { UsuarioService } from '../services/usuario.service';
import { Router } from '@angular/router';

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

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getUserObservable().subscribe(user => {
      this.isUserLoggedIn = !!user;
      this.usuarioLogueado = user?.username || null;

      if (this.isUserLoggedIn && user?.id) {
        this.usuarioService.obtenerDineroUsuario(user.id).subscribe(dinero => {
          this.usuarioDinero = dinero;
        });
      }

      this.construirMenu();
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
            { label: '💰 Ofertas', routerLink: '/ofertas' }
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
