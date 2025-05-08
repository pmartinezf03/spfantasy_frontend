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

}
