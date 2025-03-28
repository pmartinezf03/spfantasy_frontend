export interface Usuario {
  id: number;
  username: string;
  email?: string;
  role: string;
  dinero: number;           // ✅ Añadido
  titulares: number[];      // ✅ Añadido (IDs de jugadores titulares)
  suplentes: number[];      // ✅ Añadido (IDs de jugadores suplentes)
}
