import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { EstadisticasService } from '../services/estadisticas.service';
import { OfertasService } from '../services/ofertas.service';
import { Jugador } from '../models/jugador.model';
import { AuthService } from '../services/auth.service';
import { Oferta } from '../models/oferta.model';
import { WebSocketService } from '../services/websocket.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoaderService } from '../shared/loader.service';
import { Router } from '@angular/router';
import { HistorialComponent } from '../ofertas/historial/historial.component';
import { Usuario } from '../models/usuario.model';
import { TutorialService } from '../services/tutorial.service';

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

  cargandoInicial: boolean = true;  // Para ocultar todo al inicio
  saltarseSpinnerWs: boolean = false;
  primeraCargaRealizada: boolean = false;
  esVip: boolean = false;


  // 🔍 Filtros
  filtroNombre: string = '';
  filtroPosicion: string = '';
  precioMin: number | null = null;
  precioMax: number | null = null;
  posicionesDisponibles: string[] = []; // para el select


  tutorialVisto = false;
  usuario: Usuario | null = null;


  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private estadisticasService: EstadisticasService,
    private ofertasService: OfertasService,
    private cdr: ChangeDetectorRef,
    private webSocketService: WebSocketService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private loaderService: LoaderService,
    public router: Router,
    public tutorialService: TutorialService
  ) { }

  ngOnInit(): void {
    this.esVip = this.authService.esVip();

    const user = this.authService.getUser();
    if (!user || !user.id) {
      console.warn('❌ Usuario no encontrado, cancelando carga.');
      this.loaderService.hideBarraCarga();
      this.cargandoInicial = false;
      return;
    }

    const ligaId = this.authService.getLigaId();
    if (!ligaId) {
      console.warn('❌ Liga no encontrada, cancelando carga.');
      this.loaderService.hideBarraCarga();
      this.cargandoInicial = false;
      return;
    }

    this.loaderService.showBarraCarga();

    this.usuarioId = user.id;
    this.username = user.username;

    console.log('[ngOnInit] Usuario y liga válidos. Comienza carga...');
    this.suscribirseAlDinero();

    Promise.all([
      this.estadisticasService.getJugadoresDeLiga(ligaId).toPromise().then(j => j ?? []),
      this.ofertasService.obtenerOfertasPorComprador(this.usuarioId, ligaId).toPromise().then(o => o ?? [])
    ])
      .then(([jugadores, ofertas]) => {
        this.jugadores = jugadores;
        this.ofertasEnCurso = {};
        ofertas.forEach(oferta => {
          if (oferta.jugador?.id && oferta.id && oferta.estado === 'PENDIENTE') {
            this.ofertasEnCurso[oferta.jugador.id] = oferta.id;
          }
        });

        this.primeraCargaRealizada = true;
        this.cdr.detectChanges();

        this.loaderService.hideBarraCarga();
        this.cargandoInicial = false;

        console.log('[ngOnInit] Datos iniciales cargados. Vista mostrada.');
        this.suscribirseAWebSocket();

        // ⚠ Importante: solo en este punto están cargados los jugadores, así que calculamos posiciones aquí
        this.posicionesDisponibles = [...new Set(this.jugadores.map((j: Jugador) => j.posicion))].filter((p): p is string => !!p);
      })
      .catch(err => {
        console.error('❌ Error al cargar datos iniciales:', err);
        this.loaderService.hideBarraCarga();
        this.cargandoInicial = false;
      });

    this.authService.usuarioCompleto$.subscribe(usuario => {
      this.usuarioDinero = usuario?.dinero ?? 0;
      this.usuario = usuario;

      this.tutorialVisto =
        localStorage.getItem('tutorial_mercado') === 'true' ||
        localStorage.getItem('tutorial_global') === 'true' ||
        (usuario?.tutorialVisto === true);


      this.cdr.detectChanges();

      if (!this.tutorialVisto && usuario) {
        this.tutorialService.lanzarTutorialManual(usuario, 'tutorial_mercado', [
          {
            element: '.scouting-box',
            intro: '💡 Aquí puedes acceder al Scouting automático con sugerencias de fichajes (solo para usuarios VIP).'
          },
          {
            element: '.filtros-container',
            intro: '🔍 Usa estos filtros para buscar jugadores por nombre, posición o precio.'
          },
          {
            element: '.jugadores-scroll',
            intro: '🛒 Esta es la lista de jugadores disponibles. Puedes comprar directamente o hacer ofertas.'
          },
          {
            element: '.historial-scroll',
            intro: '📜 Aquí puedes ver el historial de compras, ventas y ofertas de todos los usuarios.'
          }
        ]);
      }
    });

  }



  saltarTutorial(): void {
    if (this.usuario) {
      this.tutorialService.finalizarTutorial(this.usuario.id, 'tutorial_comparador');
      this.tutorialVisto = true;
    }
  }




  get jugadoresFiltrados(): Jugador[] {
    return this.jugadores.filter(j => {
      const nombreCoincide = this.filtroNombre === '' || this.obtenerNombreJugador(j).toLowerCase().includes(this.filtroNombre.toLowerCase());
      const posicionCoincide = this.filtroPosicion === '' || j.posicion === this.filtroPosicion;
      const precioCoincide =
        (this.precioMin === null || j.precioVenta >= this.precioMin) &&
        (this.precioMax === null || j.precioVenta <= this.precioMax);

      return nombreCoincide && posicionCoincide && precioCoincide;
    });
  }





  suscribirseAlDinero(): void {
    this.authService.usuarioCompleto$.subscribe(usuario => {
      this.usuarioDinero = usuario?.dinero ?? 0;
      this.cdr.detectChanges();
    });
  }


  cargarJugadores(ligaId: number, mostrarSpinner: boolean = false): void {

    this.estadisticasService.getJugadoresDeLiga(ligaId).subscribe({
      next: (jugadores: Jugador[]) => {
        this.jugadores = jugadores;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error("❌ Error al cargar jugadores:", error);
      }
    });
  }


  get totalOfertasEnCurso(): number {
    return Object.keys(this.ofertasEnCurso).length;
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
    console.log('[comprarJugador] Iniciando compra de:', jugador.nombre);

    const token = this.authService.getToken();
    const ligaId = this.authService.getLigaId();
    if (!token || !ligaId || !jugador?.id) return;

    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas comprar a <strong>${this.obtenerNombreJugador(jugador)}</strong> por <strong>${jugador.precioVenta.toLocaleString('es-ES')} €</strong>?`,
      header: 'Confirmar compra',
      icon: 'pi pi-shopping-cart',
      acceptLabel: 'Sí, comprar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loaderService.showSpinner();

        console.log('[comprarJugador] Compra confirmada');

        this.usuarioService.comprarJugadorDeLiga(this.username, jugador.id, ligaId, token).subscribe({
          next: (response) => {
            this.loaderService.hideSpinner();


            if (response?.status === 'success') {
              console.log('[comprarJugador] Compra exitosa. Actualizando estado del usuario...');
              this.usuarioDinero = response.dinero;
              this.saltarseSpinnerWs = true;

              this.authService.refreshUsuarioCompleto();
              this.cargarJugadores(ligaId, false);

              setTimeout(() => {
                this.saltarseSpinnerWs = false;
                console.log('[comprarJugador] Fin de protección de spinner WebSocket');
              }, 2000);

              this.messageService.add({
                severity: 'success',
                summary: '¡Compra exitosa!',
                detail: `🎉 Enhorabuena, compraste a ${this.obtenerNombreJugador(jugador)}. Ya está disponible en tu plantilla.`,
                life: 6000
              });
            } else {
              console.warn('[comprarJugador] Compra fallida:', response?.mensaje);
              this.messageService.add({
                severity: 'warn',
                summary: 'Compra fallida',
                detail: response.mensaje || '⚠ No se pudo completar la compra.'
              });
            }
          },
          error: (err) => {
            console.error('❌ Error al comprar jugador de liga:', err);
            this.loaderService.hideSpinner();
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: '⚠ Ocurrió un error al intentar comprar el jugador.'
            });
          }
        });
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


  enviarOferta(oferta: { monto: number }): void {
    const monto = oferta.monto;
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
    this.ofertasEnCurso[jugadorId] = -1;
    this.cdr.detectChanges();
    this.loaderService.showSpinner();

    // 🔁 Enviamos la oferta real al backend
    this.ofertasService.crearOferta(nuevaOferta).subscribe({
      next: () => {
        // ✅ Actualizar oferta real con ID desde el backend
        this.ofertasService.obtenerUltimaOferta(this.usuarioId, jugadorId, ligaId).subscribe({
          next: (oferta) => {
            if (oferta?.id) {
              this.ofertasEnCurso[jugadorId] = oferta.id;
            } else {
              console.warn('⚠️ Oferta recibida sin ID. No se actualiza ofertasEnCurso.');
            }
            this.loaderService.hideSpinner();  // ✅ SIEMPRE SE OCULTA
            this.cdr.detectChanges();
          }
          ,
          error: (err) => {
            if (err.status === 404) {
              console.log('ℹ️ No hay ofertas previas para este jugador (aún).');
            } else {
              console.error('❌ Error al obtener última oferta:', err);
            }
            this.loaderService.hideSpinner(); // ✅ AÑADIDO AQUÍ
          }

        });

        this.authService.refreshUsuarioCompleto();
        this.cargarJugadores(ligaId, false);
      },
      error: err => {
        console.error('❌ Error al enviar oferta:', err);
        delete this.ofertasEnCurso[jugadorId];
        this.cdr.detectChanges();
        this.loaderService.hideSpinner(); // 👈 AÑADE ESTO
      }

    });
  }



  cancelarOferta(jugadorId: number): void {
    const ofertaId = this.ofertasEnCurso[jugadorId];
    if (!ofertaId) return;

    // ✅ Ocultar botón al instante
    delete this.ofertasEnCurso[jugadorId];
    this.cdr.detectChanges(); // 🔄 Refrescar vista para que aparezca "Hacer Oferta"
    this.loaderService.showSpinner();

    // 🔁 Confirmar cancelación en el backend
    this.ofertasService.retirarOferta(ofertaId).subscribe(() => {
      this.authService.refreshUsuarioCompleto(); // ✅
      this.loaderService.hideSpinner();          // 👈 AÑADE ESTO AQUÍ
    }, error => {
      console.error('❌ Error al cancelar oferta:', error);
      this.ofertasEnCurso[jugadorId] = ofertaId;
      this.cdr.detectChanges();
      this.loaderService.hideSpinner(); // ✅ ya está aquí
    });

  }


  obtenerNombreJugador(jugador: any): string {
    return jugador?.jugadorBase?.nombre || jugador?.nombre || '';
  }

  obtenerJugadorBase(jugador: any): Jugador {
    return jugador?.jugadorBase ?? jugador;
  }


  private suscribirseAWebSocket(): void {
    console.log('[WebSocket] Suscribiéndose a ofertas en vivo...');

    this.webSocketService.subscribeToOfertas(this.usuarioId);

    this.webSocketService.getOfertas().subscribe((oferta: Oferta) => {
      console.log('[WebSocket] Nueva oferta detectada:', oferta);

      const jugadorId = oferta.jugador?.id;
      const ofertaId = oferta.id;
      if (jugadorId && ofertaId) {
        this.ofertasEnCurso[jugadorId] = ofertaId;

        const ligaId = this.authService.getLigaId();
        if (!ligaId) return;

        const mostrarSpinner = !this.saltarseSpinnerWs;
        console.log('[WebSocket] Recargando jugadores. mostrarSpinner:', mostrarSpinner);

        this.cargarJugadores(ligaId, mostrarSpinner);

        this.authService.refreshUsuarioCompleto();
        this.cdr.detectChanges();
      }
    });
  }

  irAScouting(): void {
    if (this.authService.esVip()) {
      console.log('✅ Usuario VIP, redirigiendo a /scouting');
      this.router.navigate(['/scouting']);
    } else {
      console.log('🚫 Usuario NO VIP, redirigiendo a /vip');
      this.router.navigate(['/vip']);
    }
  }







}
