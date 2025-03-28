import { Component, Input } from '@angular/core';
import { Noticia } from '../../../app/models/noticia.model';

@Component({
  selector: 'app-noticias-detalle',
  templateUrl: './noticias-detalle.component.html',
  styleUrls: ['./noticias-detalle.component.css']
})
export class NoticiasDetalleComponent {
  @Input() noticia!: Noticia;

  likeNoticia(): void {
    console.log('👍 Me gusta:', this.noticia.titulo);
    // Aquí podrías guardar el like en backend
  }

  guardarNoticia(): void {
    console.log('⭐ Noticia guardada:', this.noticia.titulo);
    // Podrías guardar en perfil del usuario
  }

  compartirNoticia(): void {
    const shareText = `📰 ${this.noticia.titulo} - ${this.noticia.contenido.slice(0, 100)}...`;
    navigator.clipboard.writeText(shareText).then(() => {
      alert('🔗 Enlace copiado para compartir.');
    });
  }
}
