import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './app-loader.component.html',
  styleUrls: ['./app-loader.component.css']
})
export class AppLoaderComponent implements OnInit {
  barraVisible = false;
  spinnerVisible = false;
  progreso = 0;

  constructor(private loaderService: LoaderService) {}

  ngOnInit(): void {
    this.loaderService.getBarraObservable().subscribe(show => {
      this.barraVisible = show;
      if (show) this.simularProgreso();
    });

    this.loaderService.getSpinnerObservable().subscribe(show => {
      this.spinnerVisible = show;
    });

    this.loaderService.onBarraFinalizada().subscribe(() => {
      this.progreso = 100;
      setTimeout(() => {
        this.barraVisible = false;
      }, 400);
    });
  }

  simularProgreso() {
    this.progreso = 0;
    const interval = setInterval(() => {
      if (this.progreso < 95) {
        this.progreso += Math.random() * 6;
      } else {
        clearInterval(interval);
      }
    }, 200);
  }
}
