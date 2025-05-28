import { Component, OnInit } from '@angular/core';
import { OfertasService } from '../services/ofertas.service';
import { UsuarioService } from '../services/usuario.service';
import { AuthService } from '../services/auth.service';
import { Oferta } from '../models/oferta.model';
import { Jugador } from '../models/jugador.model';
import { ChangeDetectorRef } from '@angular/core';
import { take } from 'rxjs';
import { TutorialService } from '../services/tutorial.service';


@Component({
  selector: 'app-ofertas',
  templateUrl: './ofertas.component.html',
  styleUrls: ['./ofertas.component.css']
})

export class OfertasComponent implements OnInit {
  ofertasRecibidas: Oferta[] = [];
  ofertasEnviadas: Oferta[] = [];
  contraofertasRecibidas: Oferta[] = [];
  contraofertasEnviadas: Oferta[] = [];
  usuarioId: number = 0;
  usuarioDinero: number = 0;

  mostrarDialogoOferta: boolean = false;
  mostrarDialogoContraoferta: boolean = false;
  ofertaSeleccionada?: Oferta;
  jugadorSeleccionado?: Jugador;
  montoOferta: number = 0;
  mensajeError: string = '';
  totalOfertasEnCurso: number = 0;
  dineroActual: number = 0;
  dineroPendiente: number = 0;

  constructor(
    private ofertasService: OfertasService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private tutorialService: TutorialService,
  ) { }

  ngOnInit(): void {
    console.log("📥 Entrando a la pestaña de ofertas...");

    const usuario = this.authService.getUsuario();
    if (!usuario?.id) return;

    this.usuarioService.obtenerUsuarioCompleto(usuario.id).subscribe(usuario => {
      this.usuarioId = usuario.id;
      this.usuarioDinero = usuario.dinero ?? 0;
      this.dineroActual = usuario.dinero ?? 0;
      this.dineroPendiente = usuario.dineroPendiente ?? 0;

      const tutorialVisto = localStorage.getItem('tutorial_ofertas') === 'true'
        || localStorage.getItem('tutorial_global') === 'true'
        || usuario.tutorialVisto === true;

      if (!tutorialVisto) {
        this.lanzarTutorialOfertas(usuario.id);
      }

      this.cdr.detectChanges();

      // ✅ Dinero en tiempo real
      this.authService.usuarioCompleto$.subscribe(usuario => {
        if (usuario) {
          this.usuarioDinero = usuario.dinero ?? 0;
          this.dineroActual = usuario.dinero ?? 0;
          this.dineroPendiente = usuario.dineroPendiente ?? 0;

          console.log("💰 Dinero actualizado vía observable:", {
            dinero: this.dineroActual,
            pendiente: this.dineroPendiente
          });

          this.cdr.detectChanges();
        }
      });

      this.authService.refreshUsuarioCompleto(); // Refrescar al cargar
      this.cargarOfertas();

      this.ofertasService.marcarOfertasComoLeidas(this.usuarioId).subscribe(() => {
        console.log("✅ Ofertas marcadas como leídas al abrir la pestaña.");
        this.ofertasService.notificarLeido();
      });
    });
  }






  suscribirseAlDinero(): void {
    this.authService.usuarioCompleto$.subscribe(usuario => {
      this.usuarioDinero = usuario?.dinero ?? 0;
      this.cdr.detectChanges();
    });
  }


  private lanzarTutorialOfertas(usuarioId: number): void {
    this.tutorialService.cancelarTutorial();
    const pasos = [
      {
        id: 'paso-1',
        attachTo: { element: '#titulo-ofertas-recibidas', on: 'bottom' },
        title: '📥 Ofertas Recibidas',
        text: 'Aquí verás las ofertas que otros managers te han hecho.',
      },
      {
        id: 'paso-2',
        attachTo: { element: '#titulo-ofertas-enviadas', on: 'bottom' },
        title: '📤 Ofertas Enviadas',
        text: 'Aquí se listan las ofertas que tú has enviado.',
      },
      {
        id: 'paso-3',
        attachTo: { element: '#titulo-contraofertas', on: 'bottom' },
        title: '🔁 Contraofertas',
        text: 'Si alguien te hace una contraoferta, la verás aquí. Puedes aceptarla o rechazarla.',
      }
    ];

    this.tutorialService.lanzarTutorial(
      { id: usuarioId },
      'tutorial_ofertas',
      pasos,
      () => {
      }
    );
  }







  cargarOfertas(): void {
    const ligaId = this.authService.getLigaId();
    if (!ligaId) {
      console.warn("⚠ No hay liga activa para filtrar ofertas.");
      return;
    }

    this.ofertasService.obtenerOfertasPorVendedor(this.usuarioId, ligaId).subscribe(
      (data) => {
        console.log("📦 Ofertas recibidas desde backend (como vendedor):", data);
        this.ofertasRecibidas = data.filter(oferta => oferta.estado === 'PENDIENTE');
        this.contraofertasRecibidas = data.filter(oferta => oferta.estado === 'CONTRAOFERTA');
      }
    );


    this.ofertasService.obtenerOfertasPorComprador(this.usuarioId, ligaId).subscribe(
      (data) => {
        this.ofertasEnviadas = data.filter(o => o.estado === 'PENDIENTE');
        this.contraofertasEnviadas = data.filter(o => o.estado === 'CONTRAOFERTA');
      }
    );

  }



  retirarOferta(oferta: Oferta): void {
    this.ofertasService.retirarOferta(oferta.id!).subscribe(() => {
      console.log("✅ Oferta retirada correctamente.");

      // ✅ Eliminar directamente del array para evitar mostrarla
      this.ofertasEnviadas = this.ofertasEnviadas.filter(o => o.id !== oferta.id);
      this.contraofertasEnviadas = this.contraofertasEnviadas.filter(o => o.id !== oferta.id);

      this.authService.refreshUsuarioCompleto();
    }, error => {
      console.error("❌ Error al retirar la oferta", error);
    });
  }



  aceptarOferta(oferta: Oferta): void {
    if (!oferta?.id) {
      console.error('❌ Oferta no válida: falta el ID');
      return;
    }

    this.ofertasService.aceptarOferta(oferta.id!).subscribe({
      next: () => {
        console.log("✅ Oferta aceptada.");

        this.ofertasRecibidas = this.ofertasRecibidas.filter(o => o.id !== oferta.id);
        this.contraofertasRecibidas = this.contraofertasRecibidas.filter(o => o.id !== oferta.id);

        this.authService.refreshUsuarioCompleto();

        // 👇 Añadimos esto para actualizar inmediatamente el historial
        const historialComponent = document.querySelector('app-historial') as any;
        if (historialComponent?.ngOnInit) historialComponent.ngOnInit();

        this.cargarOfertas();
      },
      error: (error) => {
        console.error("❌ Error al aceptar la oferta:", error);
      }
    });
  }




  aceptarContraoferta(oferta: Oferta): void {
    console.log("🔎 Aceptando contraoferta:", oferta);

    this.authService.usuarioCompleto$.pipe(take(1)).subscribe(usuario => {
      const dineroDisponible = usuario?.dinero ?? 0;
      console.log("🔎 Dinero actual del usuario:", dineroDisponible);

      if (oferta.montoOferta > dineroDisponible) {
        this.mensajeError = `❌ No puedes aceptar la contraoferta por falta de fondos.
          Fondos disponibles: ${dineroDisponible} €, oferta: ${oferta.montoOferta} €`;
        alert(this.mensajeError);
        this.cdr.detectChanges();
        return;
      }

      this.ofertasService.aceptarOferta(oferta.id!).subscribe({
        next: () => {
          console.log("✅ Contraoferta aceptada correctamente, ID:", oferta.id);

          // 🧼 Eliminar oferta del listado
          this.contraofertasRecibidas = this.contraofertasRecibidas.filter(o => o.id !== oferta.id);

          // 🔁 Refrescar usuario COMPLETO para mostrar bien saldo y pendientes
          this.authService.refreshUsuarioCompleto();

          // 🔁 Volver a cargar ofertas
          this.cargarOfertas();
        },
        error: (error) => {
          console.error("❌ Error al aceptar contraoferta", error);
        }
      });
    });
  }





  rechazarOferta(oferta: Oferta): void {
    this.ofertasService.rechazarOferta(oferta.id!).subscribe({
      next: () => {
        console.log("✅ Oferta rechazada.");

        // ✅ Eliminar directamente del array
        this.ofertasRecibidas = this.ofertasRecibidas.filter(o => o.id !== oferta.id);
        this.contraofertasRecibidas = this.contraofertasRecibidas.filter(o => o.id !== oferta.id);
      },
      error: (error) => {
        console.error("❌ Error al rechazar la oferta:", error);
      }
    });
  }


  abrirDialogoOferta(jugador: Jugador): void {
    this.jugadorSeleccionado = jugador;
    this.montoOferta = 0;
    this.mensajeError = '';

    // 🔹 Obtener el dinero antes de abrir el diálogo
    this.authService.refreshUsuarioCompleto();

    // 🔹 Calcular la suma de todas las ofertas en curso
    const totalOfertasActuales = this.ofertasEnviadas.reduce((total, oferta) => total + oferta.montoOferta, 0);

    this.totalOfertasEnCurso = totalOfertasActuales;  // 🔹 Guardamos la suma

    this.mostrarDialogoOferta = true;
    this.cdr.detectChanges();
  }



  enviarOferta(monto: number): void {
    if (!this.jugadorSeleccionado) {
      console.error("❌ No se puede enviar la oferta, falta el jugador seleccionado.");
      return;
    }

    const totalOfertasActuales = this.ofertasEnviadas.reduce((total, oferta) => total + oferta.montoOferta, 0);
    const totalPropuesto = totalOfertasActuales + monto;

    if (totalPropuesto > this.usuarioDinero) {
      this.mensajeError = `❌ No puedes hacer esta oferta. Tus ofertas totales (${totalPropuesto} €) superan tu dinero disponible (${this.usuarioDinero} €).`;
      alert(this.mensajeError);
      this.cdr.detectChanges();
      return;
    }

    const ligaId = this.authService.getLigaId();
    if (!ligaId) {
      console.error("❌ No se pudo enviar la oferta: no hay liga activa.");
      return;
    }

    const nuevaOferta: Oferta = {
      jugador: this.jugadorSeleccionado,
      comprador: { id: this.usuarioId },
      vendedor: { id: this.jugadorSeleccionado.propietarioId ?? 0 },
      montoOferta: monto,
      estado: 'PENDIENTE',
      liga: { id: ligaId } // 👈 Se añade la liga
    };


    this.ofertasService.crearOferta(nuevaOferta).subscribe({
      next: () => {
        console.log("✅ Oferta enviada correctamente.");

        // ✅ Actualizar dinero desde backend inmediatamente
        this.authService.refreshUsuarioCompleto(); // ✅ Nuevo método global


        this.mostrarDialogoOferta = false;
        this.authService.refreshUsuarioCompleto();
        this.cargarOfertas();
      },
      error: (error) => {
        console.error("❌ Error al enviar la oferta", error);
        this.mensajeError = "❌ Error al enviar la oferta. Inténtalo nuevamente.";
        this.cdr.detectChanges();
      }
    });
  }



  abrirDialogoContraoferta(oferta: Oferta): void {
    this.ofertaSeleccionada = oferta;
    this.mostrarDialogoContraoferta = true;
    this.mensajeError = '';
    this.cdr.detectChanges();
  }
  enviarContraoferta({ monto }: { monto: number }): void {
    console.log("🔥 Método enviarContraoferta ejecutado. Monto recibido:", monto);

    if (!this.ofertaSeleccionada || !this.ofertaSeleccionada.jugador) {
      console.error("❌ No se puede enviar la contraoferta, falta el jugador seleccionado.");
      return;
    }

    if (!this.ofertaSeleccionada.id) {
      console.error("❌ No se puede enviar la contraoferta, falta la oferta seleccionada o su ID.");
      return;
    }

    const ligaId = this.authService.getLigaId();
    if (!ligaId) {
      console.error("❌ No se pudo enviar la contraoferta: no hay liga activa.");
      return;
    }

    const nuevaOferta: Oferta = {
      jugador: this.ofertaSeleccionada.jugador,
      comprador: { id: this.usuarioId },
      montoOferta: monto,
      estado: 'CONTRAOFERTA',
      liga: { id: ligaId }
    };

    console.log("📤 Enviando contraoferta al servicio:", nuevaOferta);

    this.ofertasService.hacerContraofertaSimple(this.ofertaSeleccionada.id!, monto).subscribe({
      next: (respuesta) => {
        console.log("✅ Contraoferta enviada correctamente:", respuesta);
        this.mostrarDialogoContraoferta = false;

        const idOriginal = this.ofertaSeleccionada?.id;
        if (idOriginal) {
          this.ofertasRecibidas = this.ofertasRecibidas.filter(o => o.id !== idOriginal);
          this.ofertasEnviadas = this.ofertasEnviadas.filter(o => o.id !== idOriginal);
          this.contraofertasRecibidas = this.contraofertasRecibidas.filter(o => o.id !== idOriginal);
          this.contraofertasEnviadas = this.contraofertasEnviadas.filter(o => o.id !== idOriginal);
        }

        this.authService.refreshUsuarioCompleto();
        this.cargarOfertas();
      },
      error: (error) => {
        console.error("❌ Error al enviar contraoferta", error);
        this.mensajeError = "❌ Error al enviar la contraoferta. Inténtalo nuevamente.";
        this.cdr.detectChanges();
      }
    });
  }




  esMovil(): boolean {
    return window.innerWidth <= 768;
  }

  obtenerNombreJugador(jugador: any): string {
    if (!jugador) return '';
    return jugador.jugadorBase ? jugador.jugadorBase.nombre : jugador.nombre;
  }




  obtenerJugadorBase(jugador: any): Jugador {
    return jugador?.jugadorBase ?? jugador;
  }





}
