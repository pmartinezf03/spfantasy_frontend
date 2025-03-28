import { Component, OnInit } from '@angular/core';
import { Jugador } from '../models/jugador.model';
import { UsuarioService } from '../services/usuario.service';
import { AuthService } from '../auth/services/auth.service';
import { JugadorService } from '../services/jugador.service'; // Asegúrate de importar el servicio de jugadores

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
    private jugadorService: JugadorService // Asegúrate de inyectar el servicio
  ) { }

  ngOnInit() {
    const user = this.authService.getUser();
    if (!user || !user.username) {
      console.error('⚠ No hay usuario logueado o falta el username.');
      return;
    }

    this.username = user.username;
    const token = this.authService.getToken();
    if (!token) {
      console.error('⚠ No hay token disponible.');
      return;
    }

    // Llamar a cargar jugadores al inicio para obtener los datos correctos
    this.obtenerDatosUsuario();
    this.cargarJugadores(); // Asegúrate de cargar los jugadores
  }

  obtenerDatosUsuario() {
    const token = this.authService.getToken();
    if (!token) return;

    this.usuarioService.obtenerUsuario(this.username, token).subscribe(usuario => {
      if (usuario) {
        this.usuarioDinero = usuario.dinero;
        this.jugadoresTitulares = usuario.titulares || [];  // ✅ Cargar solo titulares
        this.jugadoresBanquillo = usuario.suplentes || [];  // ✅ Cargar solo suplentes

        console.log("✅ Plantilla recuperada correctamente:");
        console.log("Titulares:", this.jugadoresTitulares);
        console.log("Suplentes:", this.jugadoresBanquillo);
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
    this.usuarioService.obtenerUsuario(this.username, this.authService.getToken()!).subscribe(usuario => {
      if (usuario) {
        this.usuarioDinero = usuario.dinero;
        this.jugadoresTitulares = usuario.titulares || [];
        this.jugadoresBanquillo = usuario.suplentes || [];

        console.log("🔄 Estadísticas actualizadas:");
        console.log("Titulares:", this.jugadoresTitulares);
        console.log("Suplentes:", this.jugadoresBanquillo);
      }
    }, error => {
      console.error("❌ Error obteniendo estadísticas del usuario:", error);
    });
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
    if (evento.tipo === 'titular') {
      if (this.jugadoresTitulares.length >= 5) {
        alert('❌ Solo puedes tener 5 titulares.');
        return;
      }
      evento.jugador.esTitular = true;
      this.jugadoresTitulares.push(evento.jugador);
      this.jugadoresBanquillo = this.jugadoresBanquillo.filter(j => j.id !== evento.jugador.id);
    } else {
      if (this.jugadoresBanquillo.length >= 5) {
        alert('❌ Solo puedes tener 5 jugadores en el banquillo.');
        return;
      }
      evento.jugador.esTitular = false;
      this.jugadoresBanquillo.push(evento.jugador);
      this.jugadoresTitulares = this.jugadoresTitulares.filter(j => j.id !== evento.jugador.id);
    }
  }

  venderJugador(jugador: Jugador): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error("⚠ No hay token disponible.");
      return;
    }

    console.log('💸 Enviando venta del jugador:', jugador);

    this.usuarioService.venderJugador(this.username, jugador, token).subscribe(response => {
      if (response && response.status === "success") {
        console.log('✅ Jugador vendido con éxito:', jugador);

        this.usuarioService.actualizarDineroDesdeBackend(this.username, token).subscribe();

        this.jugadoresTitulares = this.jugadoresTitulares.filter(j => j.id !== jugador.id);
        this.jugadoresBanquillo = this.jugadoresBanquillo.filter(j => j.id !== jugador.id);

        this.cargarJugadores();
        this.cargarEstadisticas();

      } else {
        console.warn('⚠ No se pudo vender el jugador.');
        alert(response.mensaje || '⚠ Error al vender el jugador.');
      }
    }, error => {
      console.error('❌ Error al vender jugador:', error);
    });
  }

  comprarJugador(jugador: Jugador): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error("⚠ No hay token disponible.");
      return;
    }

    console.log('🎯 Datos enviados para comprar el jugador:', jugador);

    if (this.jugadoresBanquillo.length >= 5) {
      alert("❌ No puedes comprar más jugadores. El banquillo ya está lleno.");
      console.warn("⚠ Banquillo lleno: No se puede comprar más jugadores.");
      return;
    }

    this.usuarioService.comprarJugador(this.username, jugador, token).subscribe(response => {
      if (response && response.status === "success") {
        console.log('✅ Jugador comprado con éxito:', jugador);

        // Actualizar el dinero del usuario
        this.usuarioDinero -= jugador.precioVenta;

        // **Agregar el jugador al banquillo**
        jugador.esTitular = false;
        this.jugadoresBanquillo.push(jugador);
        console.log("✅ Jugador añadido al banquillo.");

        this.cargarJugadores();
        console.log("🔄 Mercado actualizado después de la compra.");
      } else {
        console.warn('⚠ No se pudo comprar el jugador.');
        alert(response.mensaje || '⚠ Error al comprar el jugador.');
      }
    }, error => {
      console.error('❌ Error al comprar jugador:', error);
    });
  }

  guardarPlantilla(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error("⚠ No hay token disponible.");
      return;
    }

    if (this.jugadoresTitulares.length !== 5) {
      alert("❌ Debes seleccionar exactamente 5 jugadores titulares antes de guardar.");
      return;
    }

    const plantillaData = {
      titulares: this.jugadoresTitulares.map(j => j.id),
      suplentes: this.jugadoresBanquillo.map(j => j.id)
    };

    this.usuarioService.guardarPlantilla(this.username, plantillaData, token).subscribe(response => {
      if (response && response.status === "success") {
        alert("✅ Plantilla guardada correctamente.");
        console.log("📤 Plantilla enviada y guardada:", plantillaData);
      } else {
        alert("❌ Hubo un error al guardar la plantilla.");
      }
    }, error => {
      console.error('❌ Error al guardar plantilla:', error);
      alert("❌ Error en la petición al guardar la plantilla.");
    });
  }

  mostrarInformacion(jugador: Jugador): void {
    console.log("📌 Mostrando información del jugador:", jugador);
    this.jugadorSeleccionado = jugador;
    this.mostrarModalInformacion = true;
  }

  cerrarInformacion(): void {
    this.mostrarModalInformacion = false;
    this.jugadorSeleccionado = null;
  }
}
