import { Directive, computed, input } from '@angular/core';

export type VarianteBoton = 'primario' | 'secundario';
export type TamanoBoton = 'normal' | 'grande';

const CLASES_BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400 disabled:pointer-events-none disabled:opacity-60';

const CLASES_POR_TAMANO: Record<TamanoBoton, string> = {
  normal: 'px-5 py-2.5 text-sm',
  grande: 'px-7 py-3.5 text-base font-semibold',
};

const CLASES_POR_VARIANTE: Record<VarianteBoton, string> = {
  primario:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow-md dark:bg-indigo-500 dark:hover:bg-indigo-400',
  secundario:
    'border border-indigo-600 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-950',
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
