export interface Jugador {
  id: number;
  nombre: string;
  posicion: string;
  equipo: {
    id: number;
    nombre: string;
  };
  precioVenta: number;
  rendimiento: number;
  puntosTotales: number;
  fotoUrl: string;
  esTitular: boolean;
  pts: number;
  min: number;
  tl: number;
  t2: number;
  t3: number;
  fp: number;
  propietarioId?: number | null;  // ✅ Se añade el propietarioId para compatibilidad con la API
  propietarioUsername?: string;  // ✅ Se añade propietarioUsername para mostrar en la tabla
}
