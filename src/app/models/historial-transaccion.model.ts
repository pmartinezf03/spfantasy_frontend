export interface HistorialTransaccion {
  nombreJugador: string;
  fotoUrl: string;
  fechaCompra: string | null;
  precioCompra: number | null;
  compradoA: string | null;
  fechaVenta: string | null;
  precioVenta: number | null;
  vendidoA: string | null;
  ganancia: number | null;
}
