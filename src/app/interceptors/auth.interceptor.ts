
/**
 * AuthInterceptor
 * ----------------
 * Este interceptor HTTP se ejecuta automáticamente en cada petición que realiza Angular.
 * Su función principal es añadir el token JWT (si existe) al header "Authorization"
 * de todas las peticiones salientes hacia el backend.
 *
 * El token se obtiene desde el AuthService (almacenado previamente tras el login).
 * De esta forma, todas las peticiones protegidas se autentican sin necesidad
 * de configurar manualmente los headers en cada componente o servicio.
 *
 */


import { Injectable } from '@angular/core';

// Estas interfaces se usan para interceptar y modificar peticiones HTTP
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';

// Se importa el AuthService para obtener el token que guardamos al hacer login
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // Inyectamos el servicio de autenticación
  constructor(private authService: AuthService) { }

  // Esta función se llama automáticamente en cada petición HTTP
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtenemos el token JWT desde el AuthService
    const token = this.authService.getToken();

    // Si el token existe, lo añadimos al header "Authorization"
    if (token) {
      // Clonamos la petición original y le agregamos el header con el token
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      // Enviamos la petición modificada con el token
      return next.handle(authReq);
    }

    // Si no hay token, se envía la petición original sin modificar
    return next.handle(req);
  }
}
