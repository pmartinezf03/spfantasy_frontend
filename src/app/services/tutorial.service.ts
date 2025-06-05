// tutorial.service.ts
import { Injectable } from '@angular/core';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private shepherd: Tour;
  private tutorialYaMarcado = false;

  constructor(private usuarioService: UsuarioService) {
    this.shepherd = new Shepherd.Tour({
      defaultStepOptions: {
        scrollTo: true,
        cancelIcon: {
          enabled: true
        },
        classes: 'shadow-md bg-purple-dark',
        buttons: [
          {
            text: '⏭ Siguiente',
            action: () => this.shepherd.next()
          },
          {
            text: '❌ Cancelar',
            action: () => this.shepherd.cancel()
          },
          {
            text: ' Saltar tutorial',
            action: () => {
              const usuarioId = localStorage.getItem('usuario_id');
              const storageKey = localStorage.getItem('tutorial_key');

              if (usuarioId && storageKey) {
                this.finalizarTutorial(+usuarioId, storageKey);
                this.shepherd.cancel();
              }
            }
          }
        ]
      }
    });
  }


  lanzarTutorial(usuario: any, storageKey: string, pasos: any[], onFinish?: () => void) {
    // ️ Revisa la propiedad del usuario y el localStorage
    if (usuario.tutorialVisto || localStorage.getItem(storageKey) === 'true') return;

    // Limpieza previa
    this.shepherd.cancel();
    this.shepherd.steps = [];

    localStorage.setItem('usuario_id', usuario.id.toString());
    localStorage.setItem('tutorial_key', storageKey);

    pasos.forEach(paso => this.shepherd.addStep(paso));

    this.shepherd.on('complete', () => {
      if (onFinish) onFinish();
    });

    this.shepherd.start();
  }





  finalizarTutorial(usuarioId: number, storageKey: string) {
    if (this.tutorialYaMarcado) return;
    this.tutorialYaMarcado = true;

    localStorage.setItem('tutorial_global', 'true');
    localStorage.setItem(storageKey, 'true');

    this.usuarioService.marcarTutorialVisto(usuarioId).subscribe({
      next: () => console.log('✅ Tutorial marcado como visto'),
      error: err => console.error('❌ Error al marcar tutorial:', err)
    });
  }


  manualNextStep(): void {
    try {
      this.shepherd.next();
    } catch (e) {
      console.warn('️ No se pudo avanzar al siguiente paso del tutorial:', e);
    }
  }

  manualPrevStep(): void {
    try {
      this.shepherd.back();
    } catch (e) {
      console.warn('️ No se pudo retroceder al paso anterior del tutorial:', e);
    }
  }

  cancelarTutorial(): void {
    try {
      this.shepherd.cancel();
    } catch (e) {
      console.warn('️ No se pudo cancelar el tutorial:', e);
    }
  }


}
