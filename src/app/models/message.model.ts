import { Usuario } from './usuario.model';

export interface Message {
  id?: number;
  remitenteId?: number;
  remitenteNombre?: string;
  remitente?: Usuario;
  destinatarioId?: number | null;
  destinatario?: Usuario;
  grupoId?: number | null;
  contenido: string;
  timestamp?: string;
}
