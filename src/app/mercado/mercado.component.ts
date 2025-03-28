// mercado.component.ts
import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { JugadorService } from '../services/jugador.service';
import { Jugador } from '../models/jugador.model';
import { Usuario } from '../models/usuario.model';
import { AuthService } from '../auth/services/auth.service';

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

    // ✅ Suscripción global al dinero del usuario (actualización instantánea)
    this.usuarioService.dineroUsuario$.subscribe(dinero => {
      this.usuarioDinero = dinero;
    });
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
      this.jugadores = jugadores;
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

        // ✅ Actualización local y global del dinero tras la compra
        this.usuarioDinero = response.dinero;
        this.usuarioService.setDinero(response.dinero);

        this.cargarJugadores();

        // ✅ Emitir datos actualizados del usuario
        this.usuarioService.obtenerUsuario(this.username, token)
          .subscribe((usuarioActualizado: Usuario) => {
            this.usuarioService.datosUsuarioSubject.next(usuarioActualizado);
          });

      } else {
        alert(response.mensaje || '⚠ Error al comprar el jugador.');
      }
    });
  }

}
