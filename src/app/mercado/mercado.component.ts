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
        if (oferta.jugador?.id && oferta.id) {
          this.ofertasEnCurso[oferta.jugador.id] = oferta.id;
        }
      });
      this.cdr.detectChanges();
    });
  }

  comprarJugador(jugador: Jugador): void {
    const token = this.authService.getToken();
    if (!token || this.usuarioDinero < jugador.precioVenta) return;

    this.usuarioService.comprarJugador(this.username, jugador, token).subscribe(response => {
      if (response?.status === "success") {
        this.usuarioDinero = response.dinero;
        this.authService.refreshUsuarioCompleto(); // ✅ Esto actualiza el dinero y se refleja globalmente
        const ligaId = this.authService.getLigaId();
        if (ligaId) this.cargarJugadores(ligaId);
      } else {
        alert(response.mensaje || '⚠ Error al comprar el jugador.');
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
    this.mensajeError = '';
    this.cdr.detectChanges();
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

    this.ofertasService.crearOferta(nuevaOferta).subscribe({
      next: () => {
        this.mostrarDialogo = false;

        // Intentar recuperar la última oferta creada
        // Asignamos -1 como valor temporal para ocultar botón de "Hacer oferta"
        this.cdr.detectChanges();

        // Intentamos obtener la verdadera ID de la oferta desde el backend
        console.log('🧾 Buscando última oferta del jugadorLigaId:', jugadorId, 'para usuarioId:', this.usuarioId);

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
        



        this.suscribirseAlDinero();
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

    this.ofertasService.retirarOferta(ofertaId).subscribe(() => {
      delete this.ofertasEnCurso[jugadorId];
      this.suscribirseAlDinero();
      this.cargarOfertasUsuario();
    });
  }

  obtenerNombreJugador(jugador: any): string {
    return jugador?.jugadorBase?.nombre || jugador?.nombre || '';
  }

  obtenerJugadorBase(jugador: any): Jugador {
    return jugador?.jugadorBase ?? jugador;
  }
}
