import { Directive, computed, input } from '@angular/core';

export type VarianteBoton = 'primario' | 'secundario' | 'peligro';
export type TamanoBoton = 'normal' | 'grande';

const CLASES_BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 dark:focus-visible:outline-rose-400 disabled:pointer-events-none disabled:opacity-60';

const CLASES_POR_TAMANO: Record<TamanoBoton, string> = {
  normal: 'px-5 py-2.5 text-sm',
  grande: 'px-7 py-3.5 text-base font-semibold',
};

const CLASES_POR_VARIANTE: Record<VarianteBoton, string> = {
  primario:
    'bg-rose-800 text-white shadow-sm hover:bg-rose-900 hover:shadow-md dark:bg-rose-700 dark:hover:bg-rose-600',
  secundario:
    'border border-rose-700 text-rose-800 hover:bg-rose-50 dark:border-rose-400 dark:text-rose-300 dark:hover:bg-rose-950',
  peligro:
    'border border-red-600 text-red-700 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950',
};

/** Aplica el estilo de botón "materialista" (relleno o contorno) a un <button> o <a> nativo. */
@Directive({
  selector: '[appBoton]',
  host: {
    '[class]': 'clases()',
  },
})
export class Boton {
  readonly appBoton = input<VarianteBoton>('primario');
  readonly tamano = input<TamanoBoton>('normal');

  protected readonly clases = computed(
    () => `${CLASES_BASE} ${CLASES_POR_TAMANO[this.tamano()]} ${CLASES_POR_VARIANTE[this.appBoton()]}`,
  );
}
