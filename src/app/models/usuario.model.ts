export interface Usuario {
  id: number;
  username: string;
  email?: string;
  role: string;
  dinero: number;
  dineroPendiente: number;
  titulares: number[];
  suplentes: number[];
  alias?: string;
  liga?: {
    id: number;
    nombre: string;
  };
  vipHasta?: string | null;
  avatarUrl?: string;
  avatarBase64?: string;
  compras?: number;
  ventas?: number;
  puntos?: number;
  logins?: number;
  sesiones?: number;
  experiencia?: number;
  diasActivo?: number;
  rachaLogin?: number;
  partidasJugadas?: number;
  nivel: number;
}
