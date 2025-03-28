import { Component, OnInit } from '@angular/core';
import { Jugador } from '../models/jugador.model';
import { UsuarioService } from '../services/usuario.service';
import { AuthService } from '../auth/services/auth.service';
import { JugadorService } from '../services/jugador.service';

@Component({
  selector: 'app-mi-plantilla',
  templateUrl: './mi-plantilla.component.html',
  styleUrls: ['./mi-plantilla.component.css']
})
export class MiPlantillaComponent implements OnInit {
  todosLosJugadores: Jugador[] = [];
  jugadoresTitulares: Jugador[] = [];
  jugadoresBanquillo: Jugador[] = [];
  vistaActual: string = 'cancha';
  jugadorSeleccionado: Jugador | null = null;
  modalVisible: boolean = false;
  usuarioDinero: number = 0;
  username: string = '';
  mostrarModalInformacion: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private jugadorService: JugadorService
  ) { }

  ngOnInit() {
    const user = this.authService.getUser();
    if (!user || !user.username) {
      console.error('⚠ No hay usuario logueado o falta el username.');
      return;
    }

    this.username = user.username;
    this.obtenerDatosUsuario();
  }

  obtenerDatosUsuario() {
    const token = this.authService.getToken();
    if (!token) return;

    this.usuarioService.obtenerUsuario(this.username, token).subscribe(usuario => {
      if (usuario) {
        this.usuarioDinero = usuario.dinero;

        this.jugadorService.obtenerJugadores().subscribe(todosJugadores => {
          this.todosLosJugadores = todosJugadores;
          this.jugadoresTitulares = todosJugadores.filter(j => usuario.titulares.includes(j.id));
          this.jugadoresBanquillo = todosJugadores.filter(j => usuario.suplentes.includes(j.id));

          console.log("✅ Plantilla recuperada correctamente:");
          console.log("Titulares:", this.jugadoresTitulares);
          console.log("Suplentes:", this.jugadoresBanquillo);
        });
      }
    });
  }

  cargarJugadores(): void {
    this.jugadorService.obtenerJugadores().subscribe(jugadores => {
      this.todosLosJugadores = jugadores;
      console.log("✅ Jugadores cargados en el frontend:", this.todosLosJugadores);
    });
  }

  cargarEstadisticas(): void {
    this.obtenerDatosUsuario();
  }

  verEstadisticas(jugador: Jugador) {
    this.jugadorSeleccionado = jugador;
    this.modalVisible = true;
  }

  cerrarEstadisticas() {
    this.modalVisible = false;
    this.jugadorSeleccionado = null;
  }

  cambiarVista(vista: string) {
    this.vistaActual = vista;
  }

  moverJugador(evento: { jugador: Jugador; tipo: string }) {
    if (evento.tipo === 'titular' && this.jugadoresTitulares.length < 5) {
      evento.jugador.esTitular = true;
      this.jugadoresTitulares.push(evento.jugador);
      this.jugadoresBanquillo = this.jugadoresBanquillo.filter(j => j.id !== evento.jugador.id);
    } else if (evento.tipo === 'suplente' && this.jugadoresBanquillo.length < 5) {
      evento.jugador.esTitular = false;
      this.jugadoresBanquillo.push(evento.jugador);
      this.jugadoresTitulares = this.jugadoresTitulares.filter(j => j.id !== evento.jugador.id);
    }
  }

  venderJugador(jugador: Jugador): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.usuarioService.venderJugador(this.username, jugador, token).subscribe(response => {
      if (response.status === "success") {
        this.obtenerDatosUsuario();
        this.cargarJugadores();
      }
    });
  }

  comprarJugador(jugador: Jugador): void {
    const token = this.authService.getToken();
    if (!token || this.jugadoresBanquillo.length >= 5) return;

    this.usuarioService.comprarJugador(this.username, jugador, token).subscribe(response => {
      if (response.status === "success") {
        this.usuarioDinero -= jugador.precioVenta;
        jugador.esTitular = false;
        this.jugadoresBanquillo.push(jugador);
        this.cargarJugadores();
      }
    });
  }

  guardarPlantilla(): void {
    const token = this.authService.getToken();
    if (!token || this.jugadoresTitulares.length !== 5) return;

    const plantillaData = {
      titulares: this.jugadoresTitulares.map(j => j.id),
      suplentes: this.jugadoresBanquillo.map(j => j.id)
    };

    this.usuarioService.guardarPlantilla(this.username, plantillaData, token).subscribe();
  }

  mostrarInformacion(jugador: Jugador): void {
    this.jugadorSeleccionado = jugador;
    this.mostrarModalInformacion = true;
  }

  cerrarInformacion(): void {
    this.mostrarModalInformacion = false;
    this.jugadorSeleccionado = null;
  }
}
