import 'zone.js'; // Importa Zone.js, necesario para Angular

(window as any).global = window;

// Asegurar que `process` existe en el navegador
import * as process from 'process';
(window as any).process = process;

// Asegurar que `Buffer` existe en el navegador
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;
