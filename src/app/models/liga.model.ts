export interface Liga {
  id: number;
  nombre: string;
  codigoInvitacion: string;
  creadorId: number;
  iniciada: boolean;
  maxParticipantes: number;
  creadorNombre?: string;
}
