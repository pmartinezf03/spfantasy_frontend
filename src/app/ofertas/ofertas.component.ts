import { Component, OnInit } from '@angular/core';
import { OfertasService } from '../services/ofertas.service';
import { UsuarioService } from '../services/usuario.service';
import { AuthService } from '../services/auth.service';
import { Oferta } from '../models/oferta.model';
import { Jugador } from '../models/jugador.model';
import { ChangeDetectorRef } from '@angular/core';


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
  montoContraoferta: number = 0;
  mensajeError: string = '';
  totalOfertasEnCurso: number = 0;

  constructor(
    private ofertasService: OfertasService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log("📥 Entrando a la pestaña de ofertas...");
    console.log(this.usuarioId)
    const user = this.authService.getUser();

    if (user && user.id) {
      this.usuarioId = user.id;
      console.log("🧠 Usuario ID detectado:", this.usuarioId);

      this.obtenerDineroUsuario();
      this.cargarOfertas();

      // 🔴 MARCAR COMO LEÍDAS
      this.ofertasService.marcarOfertasComoLeidas(this.usuarioId).subscribe(() => {
        console.log("✅ Ofertas marcadas como leídas al abrir la pestaña.");
        this.ofertasService.notificarLeido();
      });
    } else {
      console.error("❌ No se encontró el usuario autenticado.");
    }
  }


  obtenerDineroUsuario(): void {
    this.usuarioService.obtenerDineroUsuario(this.usuarioId).subscribe(  // Verifica que este método exista en UsuarioService
      (dinero: number) => {
        this.usuarioDinero = dinero;
        console.log("💰 Dinero actualizado:", this.usuarioDinero);
        this.cdr.detectChanges();
      },
      error => {
        console.error('❌ Error al obtener dinero del usuario', error);
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
        console.log("🎯 Ofertas recibidas (como vendedor):", data);
        this.ofertasRecibidas = data.filter(oferta => oferta.estado !== 'CONTRAOFERTA');
        this.contraofertasRecibidas = data.filter(oferta => oferta.estado === 'CONTRAOFERTA');
      }
    );


    this.ofertasService.obtenerOfertasPorComprador(this.usuarioId, ligaId).subscribe(
      (data) => {
        this.ofertasEnviadas = data.filter(o => o.estado !== 'CONTRAOFERTA');
        this.contraofertasEnviadas = data.filter(o => o.estado === 'CONTRAOFERTA');
      }
    );

  }


  retirarOferta(oferta: Oferta): void {
    this.ofertasService.retirarOferta(oferta.id!).subscribe(() => {
      console.log("✅ Oferta retirada correctamente.");
      this.cargarOfertas();
      this.obtenerDineroUsuario();
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
        this.obtenerDineroUsuario();
      },
      error: (error) => {
        console.error("❌ Error al aceptar la oferta:", error);
      }
    });
  }



  aceptarContraoferta(oferta: Oferta): void {
    console.log("🔎 Aceptando contraoferta:", oferta);
    console.log("🔎 Dinero actual del usuario:", this.usuarioDinero);

    if (oferta.montoOferta > this.usuarioDinero) {
      this.mensajeError = `❌ No puedes aceptar la contraoferta por falta de fondos.
      Fondos disponibles: ${this.usuarioDinero} €, oferta: ${oferta.montoOferta} €`;
      alert(this.mensajeError);
      this.cdr.detectChanges();
      return;
    }

    this.ofertasService.aceptarOferta(oferta.id!).subscribe({
      next: () => {
        console.log("✅ Contraoferta aceptada correctamente, ID:", oferta.id);
        this.contraofertasRecibidas = this.contraofertasRecibidas.filter(o => o.id !== oferta.id);
        this.obtenerDineroUsuario();
        this.cargarOfertas();
      },
      error: (error) => {
        console.error("❌ Error al aceptar contraoferta", error);
      }
    });
  }



  rechazarOferta(oferta: Oferta): void {
    this.ofertasService.rechazarOferta(oferta.id!).subscribe({
      next: () => {
        console.log("✅ Oferta rechazada.");
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
    this.obtenerDineroUsuario();

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
        const username = this.authService.getUser()?.username;
        const token = this.authService.getToken();
        if (username && token) {
          this.usuarioService.actualizarDineroDesdeBackend(username, token).subscribe(dineroActualizado => {
            this.usuarioDinero = dineroActualizado;
          });
        }

        this.mostrarDialogoOferta = false;
        this.obtenerDineroUsuario();
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
    this.montoContraoferta = oferta.montoOferta;
    this.mostrarDialogoContraoferta = true;
    this.mensajeError = '';
    this.cdr.detectChanges();
  }

  enviarContraoferta(montoContraoferta: number): void {
    if (!this.ofertaSeleccionada || !this.ofertaSeleccionada.jugador) {
      console.error("❌ No se puede enviar la contraoferta, falta el jugador seleccionado.");
      return;
    }
    if (!this.ofertaSeleccionada || !this.ofertaSeleccionada.id) {
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
      vendedor: this.ofertaSeleccionada.comprador,
      montoOferta: montoContraoferta,
      estado: 'CONTRAOFERTA',
      liga: { id: ligaId } // 👈 Se añade la liga también
    };


    console.log("📤 Enviando contraoferta:", nuevaOferta);
    console.log("🔖 Oferta original seleccionada:", this.ofertaSeleccionada);

    this.ofertasService.hacerContraoferta({ ...nuevaOferta, id: this.ofertaSeleccionada.id }).subscribe({
      next: (respuesta) => {
        console.log("✅ Contraoferta enviada correctamente:", respuesta);
        this.mostrarDialogoContraoferta = false;
        this.obtenerDineroUsuario();
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
