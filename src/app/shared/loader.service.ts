import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private barraCargando$ = new BehaviorSubject<boolean>(false);
  private spinnerCargando$ = new BehaviorSubject<boolean>(false);
  private barraFinalizada$ = new Subject<void>();

  showBarraCarga() {
    this.barraCargando$.next(true);
  }

  hideBarraCarga() {
    this.barraCargando$.next(false);
    this.barraFinalizada$.next();
  }

  getBarraObservable() {
    return this.barraCargando$.asObservable();
  }

  onBarraFinalizada() {
    return this.barraFinalizada$.asObservable();
  }

  showSpinner() {
    this.spinnerCargando$.next(true);
  }

  hideSpinner() {
    this.spinnerCargando$.next(false);
  }

  getSpinnerObservable() {
    return this.spinnerCargando$.asObservable();
  }
}
