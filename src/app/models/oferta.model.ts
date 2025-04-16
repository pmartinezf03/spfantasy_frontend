import { Jugador } from './jugador.model';

export interface Oferta {
  id?: number;

  jugador: Jugador | {
    id: number;
    jugadorBase: Jugador;
    precioVenta?: number;
  };

  compradorUsername?: string;
  vendedorUsername?: string;

  comprador: { id: number; username?: string };
  vendedor?: { id: number | null; username?: string };
  montoOferta: number;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CONTRAOFERTA';
  timestamp?: string;
  leidaPorVendedor?: boolean;
  liga: { id: number };
}
