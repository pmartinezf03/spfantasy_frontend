import { Jugador } from './jugador.model';

export interface Oferta {
  id?: number;
  jugador: Jugador;  // ✅ Ahora `jugador` es un objeto completo con `nombre`
  comprador: { id: number };
  vendedor: { id: number | null };
  montoOferta: number;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CONTRAOFERTA';
  timestamp?: string;
  leidaPorVendedor?: boolean;
}
