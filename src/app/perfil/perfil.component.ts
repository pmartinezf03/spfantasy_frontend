import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuarioLogueado: any = null;
  usuarioDinero: number = 0;
  dineroPendiente: number = 0;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    
    this.authService.refreshUsuarioCompleto();

    this.authService.usuarioCompleto$.subscribe(usuario => {
      this.usuarioLogueado = usuario;
      this.usuarioDinero = usuario?.dinero ?? 0;
      this.dineroPendiente = usuario?.dineroPendiente ?? 0;
    });
  }
}
