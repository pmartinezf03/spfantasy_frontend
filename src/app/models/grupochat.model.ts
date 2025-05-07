export interface GrupoChat {
  id: number;
  nombre: string;
  descripcion?: string;
  passwordGrupo?: string;
  creadorId: number;
  usuarios: number[];
  usuariosIds: number[];
}
