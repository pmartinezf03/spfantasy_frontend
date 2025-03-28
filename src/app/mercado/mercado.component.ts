// mercado.component.ts
import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { JugadorService } from '../services/jugador.service';
import { Jugador } from '../models/jugador.model';
import { AuthService } from '../auth/services/auth.service';
import { Usuario } from '../models/usuario.model';

@Component({
  selector: 'app-mercado',
  templateUrl: './mercado.component.html',
  styleUrls: ['./mercado.component.css']
})
export class MercadoComponent implements OnInit {
  jugadores: Jugador[] = [];
  usuarioDinero: number = 0;
  username: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private jugadorService: JugadorService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user) {
      console.error('⚠ No hay usuario logueado.');
      return;
    }

    this.username = user.username;
    this.obtenerDatosUsuario();
    this.cargarJugadores();
  }

  obtenerDatosUsuario() {
    const token = this.authService.getToken();
    if (!token) return;

    this.usuarioService.actualizarDineroDesdeBackend(this.username, token)
      .subscribe(dinero => {
        this.usuarioDinero = dinero;
      });
  }

  cargarJugadores(): void {
    this.jugadorService.obtenerJugadoresDisponibles().subscribe(jugadores => {
      this.jugadores = jugadores; // ✅ Solo muestra jugadores disponibles en el mercado
      console.log("🔄 Jugadores disponibles en el mercado:", this.jugadores);
    });
  }

  comprarJugador(jugador: Jugador): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error("⚠ No hay token disponible.");
      return;
    }

    if (this.usuarioDinero < jugador.precioVenta) {
      alert("❌ No tienes suficientes fondos para comprar este jugador.");
      return;
    }

    this.usuarioService.comprarJugador(this.username, jugador, token).subscribe(response => {
      if (response && response.status === "success") {
        console.log('✅ Jugador comprado con éxito:', jugador);

        // ✅ Actualizas dinero localmente:
        this.usuarioDinero = response.dinero;

        // ✅ Emite cambio global del dinero del usuario en el servicio:
        this.usuarioService.setDinero(response.dinero);

        this.cargarJugadores();

        // ✅ Obtienes datos actualizados del usuario con método correcto:
        const token = this.authService.getToken();
        if (!token) {
          console.error('❌ No se encontró el token');
          return;
        }

        this.usuarioService.obtenerUsuario(this.username, token).subscribe((usuarioActualizado: Usuario) => {
          console.log("ℹ Usuario actualizado:", usuarioActualizado);
        });


      } else {
        alert(response.mensaje || '⚠ Error al comprar el jugador.');
      }
    });
  }
}
