import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type TonoBadge = 'neutro' | 'info' | 'atencion' | 'exito' | 'urgente';

const CLASES_POR_TONO: Record<TonoBadge, string> = {
  neutro:
    'border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200',
  info: 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  atencion:
    'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-200',
  exito:
    'border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/40 dark:text-green-200',
  urgente:
    'border-red-400 bg-red-100 text-red-900 font-semibold dark:border-red-500 dark:bg-red-900/50 dark:text-red-200',
};

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
      [class]="clases()"
    >
      {{ texto() }}
    </span>
  `,
})
export class Badge {
  readonly texto = input.required<string>();
  readonly tono = input<TonoBadge>('neutro');

  protected readonly clases = computed(() => CLASES_POR_TONO[this.tono()]);
}
