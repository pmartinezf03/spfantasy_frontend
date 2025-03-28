export interface Noticia {
  id?: number;
  titulo: string;
  contenido: string;
  fecha?: string;
  imagenUrl?: string;
  categoria?: string; // ✅ Añadido para que funcione el HTML
}
