import { Jugador } from './jugador.model';

export interface Oferta {
  id?: number;

  // Soporta tanto `jugador` directo como `jugador.jugadorBase`
  jugador: Jugador | {
    id: number;
    jugadorBase: Jugador;
    // Puedes añadir aquí más propiedades si usas más datos de JugadorLiga
    precioVenta?: number;
  };

  comprador: { id: number };
  vendedor: { id: number | null };
  montoOferta: number;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CONTRAOFERTA';
  timestamp?: string;
  leidaPorVendedor?: boolean;
  liga: { id: number };
}
