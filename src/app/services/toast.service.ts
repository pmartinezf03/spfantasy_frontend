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
    console.log('Toast Service - showToast called with message: ', message); // Verifica que el mensaje esté llegando
    this.toastSubject.next(message);
    setTimeout(() => {
      console.log('Toast Service - Hiding message');
      this.toastSubject.next(null);  // Ocultar mensaje después de 3 segundos
    }, 3000);
  }

}
