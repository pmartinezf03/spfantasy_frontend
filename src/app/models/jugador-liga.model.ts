import { Jugador } from './jugador.model';
import { Usuario } from './usuario.model';

export interface JugadorLiga {
  id: number;
  jugadorBase: Jugador;
  propietario?: Usuario | null;
  disponible: boolean;
  esTitular: boolean;
  precioVenta: number;
  puntosTotales: number;
  fotoUrl: string;
  pts: number;
  min: number;
  tl: number;
  t2: number;
  t3: number;
  fp: number;
  fechaAdquisicion?: string;
}
