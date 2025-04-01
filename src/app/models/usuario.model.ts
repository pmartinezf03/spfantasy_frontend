export interface Usuario {
  id: number;
  username: string;
  email?: string;
  role: string;
  dinero: number;
  titulares: number[];
  suplentes: number[];
}
