import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<string | null>(null);
  toast$ = this.toastSubject.asObservable();

  constructor() { }

  // Método para mostrar un mensaje de toast
  showToast(message: string) {
    // Verifica que el mensaje esté llegando
    this.toastSubject.next(message);
    setTimeout(() => {
      
      this.toastSubject.next(null);  // Ocultar mensaje después de 3 segundos
    }, 3000);
  }

}
