import { Injectable } from '@angular/core';
import { UsuarioService } from './usuario.service';
import introJs from 'intro.js';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private intro = introJs();
  private tutorialYaMarcado = false; // ✅ Nueva bandera para evitar múltiples llamadas

  constructor(private usuarioService: UsuarioService) { }

  lanzarTutorialManual(usuario: any, storageKey: string, pasos: any[], onFinish?: () => void) {
    if (
      localStorage.getItem(storageKey) === 'true' ||
      localStorage.getItem('tutorial_global') === 'true'
    ) return;

    this.intro.setOptions({
      steps: pasos,
      showProgress: true,
      showBullets: false,
      showStepNumbers: false,
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Finalizar',
      skipLabel: 'Saltar tutorial',
      exitOnEsc: false,
      exitOnOverlayClick: false,
      disableInteraction: false,
      showButtons: true
    });

    this.intro.oncomplete(() => {
      this.finalizarTutorial(usuario.id, storageKey);
      if (onFinish) onFinish();
    });

    this.intro.onbeforeexit(() => {
      const skipButton = document.querySelector('.introjs-skipbutton');
      if (document.activeElement === skipButton) {
        this.finalizarTutorial(usuario.id, storageKey);
      }
      if (onFinish) onFinish();
      return true;
    });

    this.intro.start();
  }

  finalizarTutorial(usuarioId: number, storageKey: string) {
    if (this.tutorialYaMarcado) return; // ⛔ evitar que se ejecute más de una vez
    this.tutorialYaMarcado = true;

    localStorage.setItem('tutorial_global', 'true');
    localStorage.setItem(storageKey, 'true');

    this.usuarioService.marcarTutorialVisto(usuarioId).subscribe({
      next: () => console.log('✅ Tutorial marcado como visto'),
      error: err => console.error('❌ Error al marcar tutorial:', err)
    });

    try {
      this.intro.exit(true);
    } catch (e) {
      console.warn('Tutorial ya estaba cerrado');
    }
  }

  manualNextStep = () => {
    try {
      this.intro.nextStep();
    } catch (e) {
      console.warn('❌ No se pudo avanzar el paso del tutorial');
    }
  };
}
