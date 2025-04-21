import { Pipe, PipeTransform } from '@angular/core';
import { Usuario } from '../models/usuario.model';

@Pipe({
  name: 'filtroContactos'
})
export class FiltroContactosPipe implements PipeTransform {
  transform(contactos: Usuario[], termino: string): Usuario[] {
    if (!contactos || !termino.trim()) return contactos;

    const texto = termino.toLowerCase();

    return contactos.filter(u =>
      u.username.toLowerCase().includes(texto) ||
      u.alias?.toLowerCase().includes(texto)
    );
  }
}
