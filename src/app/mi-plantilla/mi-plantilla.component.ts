import { Component, OnInit } from '@angular/core';
import { Jugador } from '../models/jugador.model';
import { UsuarioService } from '../services/usuario.service';
import { AuthService } from '../services/auth.service';
import { JugadorService } from '../services/jugador.service'; // Asegúrate de importar el servicio de jugadores
import { ChangeDetectorRef } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoaderService } from '../shared/loader.service';

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
  fechaActual: string = '';
  resumenStats: { icono: string, titulo: string, valor: string }[] = [];
  radarStatsData: ChartData<'radar'> = { labels: [], datasets: [] };
  radarStatsOptions: ChartOptions<'radar'> = {};
  puntosSemanales: { [jugadorId: number]: string } = {};

  graficoRendimiento: ChartData<'line'> = { labels: [], datasets: [] };
  graficoPorcentajes: ChartData<'radar'> = { labels: [], datasets: [] };
  graficoRendimientoOptions: ChartOptions<'line'> = {};
  jugadoresPorPosicion: { [posicion: string]: Jugador[] } = {};


  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private jugadorService: JugadorService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private loaderService: LoaderService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    // 🧩 loader start
    this.loaderService.showBarraCarga();
    // 🧩 loader end

    this.fechaActual = new Date().toLocaleString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    const user = this.authService.getUser();
    if (!user || !user.username) {
      console.error('⚠ No hay usuario logueado o falta el username.');
      this.loaderService.hideBarraCarga(); // 🧩 importante ocultar en error también
      return;
    }

    this.username = user.username;

    this.authService.getLigaObservable().subscribe(ligaId => {
      if (ligaId && user.id) {
        this.obtenerDatosUsuario();
        this.cargarDinero();
        this.cdr.detectChanges();
      } else {
        this.loaderService.hideBarraCarga(); // 🧩 evitar spinner infinito
      }
    });
  }


  obtenerDatosUsuario() {
    const token = this.authService.getToken();
    if (!token) {
      this.loaderService.hideBarraCarga();
      return;
    }

    this.usuarioService.obtenerUsuario(this.username, token).subscribe(usuario => {
      if (usuario) {
        this.usuarioDinero = usuario.dinero;

        // 1. Cargar titulares
        this.jugadoresTitulares = (usuario.titulares || []).map((j: any) => ({
          ...j,
          idLiga: j.id,
          esTitular: true
        }));

        // 2. Cargar suplentes
        this.jugadoresBanquillo = (usuario.suplentes || []).map((j: any) => ({
          ...j,
          idLiga: j.id,
          esTitular: false
        }));

        // 3. Agrupar titulares por posición
        this.jugadoresPorPosicion = {
          base: [],
          escolta: [],
          alero: [],
          alaPivot: [],
          pivot: []
        };

        this.jugadoresTitulares.forEach(j => {
          const key = this.normalizarPosicion(j.posicion); // genera 'pivot', 'alapivot', etc.
          if (this.jugadoresPorPosicion[key]) {
            this.jugadoresPorPosicion[key].push(j);
          } else {
            console.warn(`⚠ Posición no mapeada: "${j.posicion}" → "${key}"`);
          }

        });



        console.log("✅ Plantilla recuperada correctamente:");
        this.generarGraficosTitulares();
        this.loaderService.hideBarraCarga();
      } else {
        this.loaderService.hideBarraCarga();
      }
    });

    this.usuarioService.obtenerPuntosSemanales(this.username, token).subscribe({
      next: puntos => {
        this.puntosSemanales = puntos;
        console.log("📊 Puntos semanales por jugador:", puntos);
      },
      error: err => {
        console.error("❌ Error al obtener puntos semanales:", err);
      }
    });
  }


  cargarDinero() {
    const token = this.authService.getToken();
    if (!token) return;

    this.usuarioService.obtenerUsuario(this.username, token).subscribe(usuario => {
      if (usuario) {
        this.usuarioDinero = usuario.dinero;
      }
    });
  }


  cargarJugadores(): void {
    const ligaId = this.authService.getLigaId();
    const usuarioId = this.authService.getUserId();

    if (!ligaId || !usuarioId) {
      console.warn("⚠ No hay ligaId o usuarioId disponibles.");
      return;
    }

    this.jugadorService.obtenerJugadoresDeUsuarioEnLiga(ligaId, usuarioId).subscribe({
      next: jugadores => {
        console.log("✅ Jugadores recibidos para mostrar en vista LISTA:");
        console.table(jugadores);
        this.todosLosJugadores = jugadores;

        // Separar titulares y suplentes si la API no lo hace
        this.jugadoresTitulares = jugadores.filter(j => j.esTitular);
        this.jugadoresBanquillo = jugadores.filter(j => !j.esTitular);
        this.generarRadarYDistribucion();

        console.log("✅ Jugadores de la liga cargados:", jugadores);
      },
      error: err => {
        console.error("❌ Error al cargar jugadores de la liga:", err);
      }
    });
  }


  cargarEstadisticas(): void {
    this.usuarioService.obtenerUsuario(this.username, this.authService.getToken()!).subscribe(usuario => {
      if (usuario) {
        this.usuarioDinero = usuario.dinero;
        this.jugadoresTitulares = (usuario.titulares || []).map((j: Jugador) => ({
          ...j,
          esTitular: j.esTitular
        }));
        this.jugadoresBanquillo = (usuario.suplentes || []).map((j: Jugador) => ({
          ...j,
          esTitular: j.esTitular
        }));


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
    evento.jugador.esTitular = evento.tipo === 'titular';

    // 🔁 Siempre actualiza el array de titulares a partir del mapa por posición
    this.jugadoresTitulares = Object.values(this.jugadoresPorPosicion).flat();
  }




  venderJugador(jugador: Jugador): void {
    this.confirmationService.confirm({
      message: `¿Seguro que quieres vender a ${jugador.nombre} por ${jugador.precioVenta.toLocaleString('es-ES')} €?`,
      header: 'Confirmar Venta',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, vender',
      rejectLabel: 'Cancelar',
      accept: () => {
        const token = this.authService.getToken();
        if (!token || !this.username) return;

        if (!jugador.idLiga) {
          console.error("❌ El jugador no tiene un idLiga definido:", jugador);
          alert("❌ Error: Este jugador no tiene un ID válido en la liga.");
          return;
        }

        this.loaderService.showSpinner(); // 🧩 mostrar spinner

        this.usuarioService.venderJugadorDeLiga(this.username, jugador.idLiga, token)
          .subscribe({
            next: (response) => {
              console.log("✅ [FRONT] Respuesta correcta del backend:", response);

              this.jugadoresTitulares = this.jugadoresTitulares.filter(j => j.id !== jugador.id);
              this.jugadoresBanquillo = this.jugadoresBanquillo.filter(j => j.id !== jugador.id);
              this.authService.refreshUsuarioCompleto();
              this.cargarJugadores();

              this.loaderService.hideSpinner(); // 🧩 ocultar spinner

              // ✅ Notificación de éxito
              this.messageService.add({
                severity: 'success',
                summary: 'Jugador Vendido',
                detail: `✅ Has vendido a ${jugador.nombre} correctamente, tu dinero será reembolsado.`,
                life: 5000
              });
            },
            error: (err) => {
              console.error("❌ [FRONT] Error al vender jugador:", err);
              this.loaderService.hideSpinner();

              this.messageService.add({
                severity: 'error',
                summary: 'Error en la venta',
                detail: '❌ No se pudo vender el jugador. Inténtalo de nuevo.',
                life: 5000
              });
            }
          });
      }
    });
  }






  get jugadoresCompletos(): Jugador[] {
    return [...this.jugadoresTitulares, ...this.jugadoresBanquillo];
  }




  comprarJugador(jugador: Jugador): void {
    this.confirmationService.confirm({
      message: `¿Seguro que quieres comprar a ${jugador.nombre} por ${jugador.precioVenta.toLocaleString('es-ES')} €?`,
      header: 'Confirmar Compra',
      icon: 'pi pi-shopping-cart',
      acceptLabel: 'Sí, comprar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const token = this.authService.getToken();
        const ligaId = this.authService.getLigaId();

        if (!token || !this.username || !ligaId) {
          console.error("⚠ Faltan datos para comprar jugador.");
          return;
        }

        if (this.usuarioDinero < jugador.precioVenta) {
          alert('❌ No tienes suficiente dinero para comprar este jugador.');
          return;
        }

        // 🧩 Spinner superpuesto
        this.loaderService.showSpinner();

        this.usuarioService.comprarJugadorDeLiga(this.username, jugador.id, ligaId, token).subscribe({
          next: () => {
            console.log('✅ Jugador comprado correctamente');
            this.authService.refreshUsuarioCompleto();
            this.cargarJugadores();

            this.loaderService.hideSpinner(); // 🧩 ocultar spinner

            // ✅ Mensaje de éxito
            alert(`✅ Has comprado a ${jugador.nombre}. Ya está disponible en tu plantilla.`);
          },
          error: (error) => {
            console.error("❌ Error al comprar jugador:", error);
            alert("❌ No se pudo comprar el jugador.");
            this.loaderService.hideSpinner(); // 🧩 ocultar en error también
          }
        });
      }
    });
  }





  guardarPlantilla(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error("⚠ No hay token disponible.");
      return;
    }

    // 🔄 1. Obtener titulares desde las posiciones
    const titulares: Jugador[] = Object.values(this.jugadoresPorPosicion).flat();

    // ❗ Validar exactamente 5 titulares
    const idsTitulares = new Set(titulares.map(j => j.idLiga ?? j.id));
    if (idsTitulares.size !== 5) {
      alert("❌ Debes tener exactamente 5 jugadores titulares únicos.");
      return;
    }

    // 🔄 2. Calcular suplentes automáticamente
    const idsTitularesSet = new Set(titulares.map(j => j.id));
    const todosJugadores = [...titulares, ...this.jugadoresBanquillo];

    const suplentes: Jugador[] = todosJugadores.filter(j => !idsTitularesSet.has(j.id));

    // ✅ 3. Guardar estructura limpia
    const plantillaData = {
      titulares: titulares.map(j => j.idLiga ?? j.id),
      suplentes: suplentes.map(j => j.idLiga ?? j.id)
    };

    console.log("📤 Enviando plantilla a guardar:", plantillaData);

    this.usuarioService.guardarPlantilla(this.username, plantillaData, token).subscribe({
      next: (res) => {
        if (res.status === "success") {
          alert("✅ Plantilla guardada correctamente.");
          this.authService.refreshUsuarioCompleto();
          this.cargarEstadisticas();
        } else {
          alert("❌ No se pudo guardar la plantilla.");
        }
      },
      error: (err) => {
        console.error("❌ Error guardando plantilla:", err);
        alert("❌ Error al guardar la plantilla. Ver consola.");
      }
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

  esMovil(): boolean {
    return window.innerWidth <= 768;
  }


  getPromedioFp(): number {
    const jugadores = this.jugadoresCompletos.filter(j => j.fp !== undefined);
    return jugadores.length ? jugadores.reduce((sum, j) => sum + (j.fp ?? 0), 0) / jugadores.length : 0;
  }

  getTotalPuntos(): number {
    return this.jugadoresCompletos.reduce((sum, j) => sum + (j.pts ?? 0), 0);
  }

  getTotalPrecio(): number {
    return this.jugadoresCompletos.reduce((sum, j) => sum + (j.precioVenta ?? 0), 0);
  }

  getDistribucionRol(): { titulares: number, banquillo: number } {
    const titulares = this.jugadoresTitulares.length;
    const banquillo = this.jugadoresBanquillo.length;
    return { titulares, banquillo };
  }

  generarRadarYDistribucion(): void {
    const jugadores = this.jugadoresCompletos;

    if (!jugadores.length) return;

    const totalT2 = jugadores.reduce((s, j) => s + (j.t2 ?? 0), 0);
    const totalT3 = jugadores.reduce((s, j) => s + (j.t3 ?? 0), 0);
    const totalTL = jugadores.reduce((s, j) => s + (j.tl ?? 0), 0);
    const totalMin = jugadores.reduce((s, j) => s + (j.min ?? 0), 0);
    const totalFp = jugadores.reduce((s, j) => s + (j.fp ?? 0), 0);

    const cantidad = jugadores.length;

    const promT2 = totalT2 / cantidad;
    const promT3 = totalT3 / cantidad;
    const promTL = totalTL / cantidad;
    const promMin = totalMin / cantidad;
    const promFp = totalFp / cantidad;

    // 📡 Radar
    this.radarStatsData = {
      labels: ['T2', 'T3', 'TL', 'Min', 'FP'],
      datasets: [
        {
          label: 'Promedio Plantilla',
          data: [promT2, promT3, promTL, promMin, promFp],
          backgroundColor: 'rgba(59,130,246,0.2)',
          borderColor: '#3b82f6',
          pointBackgroundColor: '#3b82f6',
          borderWidth: 2
        }
      ]
    };

    this.radarStatsOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          pointLabels: { color: '#1f2937', font: { size: 14 } },
          ticks: {
            color: '#4b5563',
            backdropColor: 'transparent'
          },
          grid: { color: 'rgba(0,0,0,0.1)' },
          angleLines: { color: 'rgba(0,0,0,0.1)' }
        }
      }
      ,
      plugins: {
        legend: {
          display: true,
          labels: { color: '#1f2937' }
        }
      }
    };

    // 🧾 Tarjetas de resumen
    const totalPrecio = jugadores.reduce((s, j) => s + (j.precioVenta ?? 0), 0);

    this.resumenStats = [
      {
        icono: '💰',
        titulo: 'Valor total',
        valor: totalPrecio.toLocaleString('es-ES') + ' €'
      },
      {
        icono: '⭐',
        titulo: 'Prom. FP',
        valor: promFp.toFixed(1)
      },
      {
        icono: '🕒',
        titulo: 'Min. prom.',
        valor: promMin.toFixed(1)
      },
      {
        icono: '📊',
        titulo: 'Titulares / Banquillo',
        valor: `${this.jugadoresTitulares.length} / ${this.jugadoresBanquillo.length}`
      }
    ];
  }


  generarGraficosTitulares(): void {
    const titulares = this.jugadoresTitulares;

    if (!titulares.length) return;

    // === Radar: % de tiro (T2, T3, TL, FP) ===
    const totalT2 = titulares.reduce((s, j) => s + (j.t2 ?? 0), 0);
    const totalT3 = titulares.reduce((s, j) => s + (j.t3 ?? 0), 0);
    const totalTL = titulares.reduce((s, j) => s + (j.tl ?? 0), 0);
    const totalFP = titulares.reduce((s, j) => s + (j.fp ?? 0), 0);
    const cantidad = titulares.length;

    this.graficoPorcentajes = {
      labels: ['T2', 'T3', 'TL', 'FP'],
      datasets: [{
        label: 'Promedios Semana',
        data: [totalT2 / cantidad, totalT3 / cantidad, totalTL / cantidad, totalFP / cantidad],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: '#4f46e5',
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#1e40af',
        pointHoverBackgroundColor: '#1e3a8a',
        borderWidth: 2
      }]
    };

    // === Línea: Rendimiento Diario (simulado) ===
    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const coloresLegibles = [
      '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'
    ];

    const dataset = titulares.map((j, i) => ({
      label: j.nombre,
      data: Array(7).fill(0).map(() => Math.floor(Math.random() * 25)), // Fake FP por día
      fill: false,
      borderColor: coloresLegibles[i % coloresLegibles.length],
      tension: 0.3
    }));

    this.graficoRendimiento = {
      labels,
      datasets: dataset
    };

    this.graficoRendimientoOptions = {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#1e293b',
            font: {
              size: 12,
              weight: 'bold'
            },
            padding: 10
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#374151'
          },
          grid: {
            color: 'rgba(0,0,0,0.05)'
          }
        },
        y: {
          ticks: {
            color: '#374151'
          },
          grid: {
            color: 'rgba(0,0,0,0.05)'
          }
        }
      }
    };
  }


  private normalizarPosicion(pos: string): string {
    return pos
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quita tildes
      .toLowerCase()
      .replace(/\s|-/g, '') // elimina espacios y guiones
      .replace('alapivot', 'alaPivot'); // deja esta como camelCase
  }








}
