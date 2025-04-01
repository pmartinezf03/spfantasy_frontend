import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EstadisticasService } from '../../app/services/estadisticas.service';
import { OfertasService } from '../../app/services/ofertas.service';
import { UsuarioService } from '../../app/services/usuario.service';
import { Jugador } from '../../app/models/jugador.model';
import { Oferta } from '../../app/models/oferta.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-estadisticas-liga',
  templateUrl: './estadisticas-liga.component.html',
  styleUrls: ['./estadisticas-liga.component.css']
})
export class EstadisticasLigaComponent implements OnInit {
  jugadores: Jugador[] = [];
  usuarioId: number = 0;
  usuarioDinero: number = 0;
  totalOfertasEnCurso: number = 0;
  ofertasEnCurso: { [jugadorId: number]: number } = {};

  mostrarDialogo: boolean = false;
  jugadorSeleccionado?: Jugador;
  mensajeError: string = '';

  constructor(
    private estadisticasService: EstadisticasService,
    private ofertasService: OfertasService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user?.id) {
      this.usuarioId = user.id;
      this.obtenerDineroUsuario();
      this.cargarOfertasUsuario();
    } else {
      console.error("❌ No se encontró el usuario autenticado.");
    }

    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.estadisticasService.obtenerEstadisticas().subscribe(data => {
      this.jugadores = data.map(jugador => ({
        ...jugador,
        propietarioId: jugador.propietarioId ?? 0,
        propietarioUsername: jugador.propietarioUsername ?? 'Libre'
      }));
      this.cdr.detectChanges();
    }, error => {
      console.error("❌ Error obteniendo las estadísticas:", error);
    });
  }

  obtenerDineroUsuario(): void {
    this.usuarioService.obtenerDineroUsuario(this.usuarioId).subscribe(dinero => {
      this.usuarioDinero = dinero ?? 0;
      console.log("💰 Dinero disponible actualizado:", this.usuarioDinero);
      this.cdr.detectChanges();
    }, error => {
      console.error("❌ Error al obtener el dinero del usuario", error);
    });
  }

  cargarOfertasUsuario(): void {
    this.ofertasService.obtenerOfertasPorComprador(this.usuarioId).subscribe(ofertas => {
      this.totalOfertasEnCurso = ofertas.reduce((total, oferta) => total + (oferta.montoOferta ?? 0), 0);
      this.ofertasEnCurso = {};
      ofertas.forEach(oferta => {
        if (oferta.jugador?.id !== undefined && oferta.id !== undefined) {
          this.ofertasEnCurso[oferta.jugador.id] = oferta.id;
        }
      });
      console.log("📊 Ofertas en curso:", this.ofertasEnCurso);
      this.cdr.detectChanges();
    }, error => {
      console.error("❌ Error al obtener ofertas en curso", error);
    });
  }

  abrirDialogoOferta(jugador: Jugador): void {
    console.log("🔵 Abriendo diálogo para hacer oferta a:", jugador);
    this.jugadorSeleccionado = jugador;
    this.mostrarDialogo = true;
    this.mensajeError = '';
    this.cdr.detectChanges();
  }

  cerrarDialogoOferta(): void {
    console.log("🔴 Cerrando diálogo de oferta");
    this.mostrarDialogo = false;
    this.mensajeError = '';
    this.cdr.detectChanges();
  }

  enviarOferta(event: { monto: number }): void {
    if (!this.jugadorSeleccionado || (this.jugadorSeleccionado.propietarioId ?? 0) === 0) {
      console.error("❌ No se puede enviar una oferta a un jugador sin propietario.");
      return;
    }

    const totalPropuesto = this.totalOfertasEnCurso + event.monto;
    if (totalPropuesto > this.usuarioDinero) {
      console.error(`❌ No puedes hacer esta oferta. Tus ofertas totales (${totalPropuesto} €) superan tu dinero disponible (${this.usuarioDinero} €).`);
      this.mensajeError = `❌ No puedes hacer esta oferta. Tus ofertas totales (${totalPropuesto} €) superan tu dinero disponible (${this.usuarioDinero} €).`;
      this.cdr.detectChanges();
      return;
    }

    const nuevaOferta: Oferta = {
      jugador: this.jugadorSeleccionado,
      comprador: { id: this.usuarioId },
      vendedor: { id: this.jugadorSeleccionado.propietarioId ?? 0 },
      montoOferta: event.monto,
      estado: "PENDIENTE"
    };

    this.ofertasService.crearOferta(nuevaOferta).subscribe(ofertaCreada => {
      console.log("✅ Oferta enviada correctamente");
      if (this.jugadorSeleccionado?.id !== undefined) {
        this.ofertasEnCurso[this.jugadorSeleccionado.id] = ofertaCreada.id ?? 0;
      }
      this.cerrarDialogoOferta();
      this.obtenerDineroUsuario();
      this.cargarOfertasUsuario();
    }, error => {
      console.error("❌ Error al enviar la oferta:", error);
      this.mensajeError = "❌ Error al enviar la oferta. Inténtalo nuevamente.";
      this.cdr.detectChanges();
    });
  }

  cancelarOferta(jugadorId: number): void {
    const ofertaId = this.ofertasEnCurso[jugadorId] ?? 0;
    if (!ofertaId) return;

    this.ofertasService.retirarOferta(ofertaId).subscribe(() => {
      console.log("✅ Oferta cancelada correctamente");
      delete this.ofertasEnCurso[jugadorId];
      this.obtenerDineroUsuario();
      this.cargarOfertasUsuario();
    }, error => {
      console.error("❌ Error al cancelar la oferta:", error);
    });
  }
}
