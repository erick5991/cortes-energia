import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type Tema = 'claro' | 'oscuro';

const CLAVE_TEMA = 'tema';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly temaActual = signal<Tema>(this.leerTemaInicial());

  readonly tema = this.temaActual.asReadonly();

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.temaActual() === 'oscuro');
    });
  }

  alternar(): void {
    const nuevo: Tema = this.temaActual() === 'oscuro' ? 'claro' : 'oscuro';
    this.temaActual.set(nuevo);
    localStorage.setItem(CLAVE_TEMA, nuevo);
  }

  private leerTemaInicial(): Tema {
    const guardado = localStorage.getItem(CLAVE_TEMA);
    if (guardado === 'claro' || guardado === 'oscuro') {
      return guardado;
    }
    const prefiereOscuro =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefiereOscuro ? 'oscuro' : 'claro';
  }
}
