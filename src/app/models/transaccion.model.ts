import { JugadorLiga } from './jugador-liga.model';
import { Usuario } from './usuario.model';

export interface Transaccion {
  id: number;
  fecha: string;
  precio: number;

  nombreJugador: string;
  fotoUrl: string;

  compradorUsername?: string | null;
  vendedorUsername?: string | null;

  compradorId?: number | null;
  vendedorId?: number | null;

  ligaId?: number;
  ligaNombre?: string;
}


