import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { UsuarioService } from '../services/usuario.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuarioLogueado: any = null;
  usuarioDinero: number = 0;

  constructor(private authService: AuthService, private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    const token = this.authService.getToken();

    if (user && token) {
      this.usuarioLogueado = user;

      this.usuarioService.actualizarDineroDesdeBackend(user.username, token).subscribe();

      this.usuarioService.dineroUsuario$.subscribe(dinero => {
        this.usuarioDinero = dinero;
      });
    }
  }

}
