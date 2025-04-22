import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { EstadisticasService } from '../services/estadisticas.service';
import { OfertasService } from '../services/ofertas.service';
import { Jugador } from '../models/jugador.model';
import { AuthService } from '../services/auth.service';
import { Oferta } from '../models/oferta.model';
import { WebSocketService } from '../services/websocket.service';

@Component({
  selector: 'app-mercado',
  templateUrl: './mercado.component.html',
  styleUrls: ['./mercado.component.css']
})
export class MercadoComponent implements OnInit {
  jugadores: Jugador[] = [];
  usuarioId: number = 0;
  usuarioDinero: number = 0;
  username: string = '';
  ofertasEnCurso: { [jugadorId: number]: number } = {};
  jugadorSeleccionado?: Jugador;
  mostrarDialogo: boolean = false;
  mensajeError: string = '';

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private estadisticasService: EstadisticasService,
    private ofertasService: OfertasService,
    private cdr: ChangeDetectorRef,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user || !user.id) return;

    this.usuarioId = user.id;
    this.username = user.username;

    this.suscribirseAlDinero(); // ✅ dinero actualizado
    this.cargarOfertasUsuario(); // ✅ carga inicial
    this.webSocketService.subscribeToOfertas(this.usuarioId); // 👈 suscripción WebSocket

    this.webSocketService.getOfertas().subscribe((oferta: Oferta) => {
      const jugadorId = oferta.jugador?.id;
      const ofertaId = oferta.id;

      if (typeof jugadorId === 'number' && typeof ofertaId === 'number') {
        this.ofertasEnCurso[jugadorId] = ofertaId;

        const ligaId = this.authService.getLigaId();
        if (ligaId) this.cargarJugadores(ligaId);
        this.authService.refreshUsuarioCompleto(); // 🔄 actualizar dinero tras enviar oferta


        this.cdr.detectChanges();
      }
    });


    this.authService.getLigaObservable().subscribe(ligaId => {
      if (ligaId) this.cargarJugadores(ligaId);
    });
  }



  suscribirseAlDinero(): void {
    this.authService.usuarioCompleto$.subscribe(usuario => {
      this.usuarioDinero = usuario?.dinero ?? 0;
      this.cdr.detectChanges();
    });
  }


  cargarJugadores(ligaId: number): void {
    this.estadisticasService.obtenerJugadoresDeLiga(ligaId).subscribe((jugadores: Jugador[]) => {
      this.jugadores = jugadores;
      this.cdr.detectChanges();
    });
  }

  cargarOfertasUsuario(): void {
    const ligaId = this.authService.getLigaId();
    if (!ligaId) return;

    this.ofertasService.obtenerOfertasPorComprador(this.usuarioId, ligaId).subscribe(ofertas => {
      this.ofertasEnCurso = {};
      ofertas.forEach(oferta => {
        if (
          oferta.jugador?.id &&
          oferta.id &&
          oferta.estado === 'PENDIENTE' // ✅ Solo si está pendiente
        ) {
          this.ofertasEnCurso[oferta.jugador.id] = oferta.id;
        }
      });
      this.cdr.detectChanges();
    });

  }
  comprarJugador(jugador: Jugador): void {
    const token = this.authService.getToken();
    const ligaId = this.authService.getLigaId();
    if (!token || !ligaId || !jugador?.id) return;

    const jugadorBaseId = jugador.id;

    this.usuarioService.comprarJugadorDeLiga(this.username, jugadorBaseId, ligaId, token).subscribe({
      next: (response) => {
        if (response?.status === 'success') {
          this.usuarioDinero = response.dinero;
          this.authService.refreshUsuarioCompleto();
          this.cargarJugadores(ligaId);
        } else {
          alert(response.mensaje || '⚠ Error al comprar el jugador.');
        }
      },
      error: (err) => {
        console.error('❌ Error al comprar jugador de liga:', err);
        alert('⚠ Error al comprar el jugador.');
      }
    });
  }



  abrirDialogoOferta(jugador: Jugador): void {
    this.jugadorSeleccionado = jugador;
    this.mostrarDialogo = true;
    this.mensajeError = '';
    this.cdr.detectChanges();
  }

  cerrarDialogoOferta(): void {
    this.jugadorSeleccionado = undefined;
    this.mostrarDialogo = false;

    // 🔄 Refrescar usuario completo para actualizar dinero y dineroPendiente
    this.authService.refreshUsuarioCompleto();

  }


  enviarOferta(monto: number): void {
    if (!this.jugadorSeleccionado?.id || !this.jugadorSeleccionado?.propietarioId) {
      console.error('Datos de jugador no válidos al enviar oferta');
      return;
    }

    const jugadorId = this.jugadorSeleccionado.id;
    const ligaId = this.authService.getLigaId();
    if (!ligaId) return;

    const nuevaOferta: Oferta = {
      comprador: { id: this.usuarioId },
      vendedor: { id: this.jugadorSeleccionado.propietarioId },
      montoOferta: monto,
      jugador: this.jugadorSeleccionado,
      liga: { id: ligaId },
      estado: 'PENDIENTE',
      timestamp: new Date().toISOString()
    };

    // ✅ Cerramos el diálogo
    this.mostrarDialogo = false;

    // ✅ Mostramos botón de "Cancelar oferta" al instante
    this.ofertasEnCurso[jugadorId] = -1; // Marcamos como oferta pendiente local
    this.cdr.detectChanges(); // 🔄 Forzamos render inmediato

    // 🔁 Enviamos la oferta real al backend
    this.ofertasService.crearOferta(nuevaOferta).subscribe({
      next: () => {
        // Luego obtenemos la oferta real del backend (con ID)
        this.ofertasService.obtenerUltimaOferta(this.usuarioId, jugadorId).subscribe({
          next: (oferta) => {
            if (oferta?.id) {
              this.ofertasEnCurso[jugadorId] = oferta.id;
              this.cdr.detectChanges();
            }
          },
          error: (err) => {
            if (err.status === 404) {
              console.log('ℹ️ No hay ofertas previas para este jugador (aún).');
            } else {
              console.error('❌ Error al obtener última oferta:', err);
            }
          }
        });

        this.authService.refreshUsuarioCompleto();
        this.cargarJugadores(ligaId);
      },
      error: err => {
        console.error('Error al enviar oferta:', err);
      }
    });
  }


  cancelarOferta(jugadorId: number): void {
    const ofertaId = this.ofertasEnCurso[jugadorId];
    if (!ofertaId) return;

    // ✅ Ocultar botón al instante
    delete this.ofertasEnCurso[jugadorId];
    this.cdr.detectChanges(); // 🔄 Refrescar vista para que aparezca "Hacer Oferta"

    // 🔁 Confirmar cancelación en el backend
    this.ofertasService.retirarOferta(ofertaId).subscribe(() => {
      // Opcional: volver a verificar con el backend si quieres seguridad
      // this.cargarOfertasUsuario();
      this.authService.refreshUsuarioCompleto(); // Actualizar dinero tras cancelación
    }, error => {
      console.error('❌ Error al cancelar oferta:', error);
      // En caso de error, volvemos a marcarla como activa
      this.ofertasEnCurso[jugadorId] = ofertaId;
      this.cdr.detectChanges();
    });
  }


  obtenerNombreJugador(jugador: any): string {
    return jugador?.jugadorBase?.nombre || jugador?.nombre || '';
  }

  obtenerJugadorBase(jugador: any): Jugador {
    return jugador?.jugadorBase ?? jugador;
  }
}
