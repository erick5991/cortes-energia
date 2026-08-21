import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import type { Reporte } from '../../../core/models/reporte.model';
import { ReportesService } from '../../../core/services/reportes.service';
import { ReporteRevisionCard } from './reporte-revision-card';

@Component({
  selector: 'app-admin-reportes',
  imports: [ReporteRevisionCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="titulo-admin-reportes" class="flex flex-col gap-6">
      <div>
        <span
          class="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-800 dark:bg-amber-900/30 dark:text-amber-300"
        >
          Panel admin
        </span>
        <h1 id="titulo-admin-reportes" class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Reportes de usuarios
        </h1>
        <span class="mt-3 block h-1.5 w-14 rounded-full bg-amber-400" aria-hidden="true"></span>
        <p class="mt-3 text-base text-stone-600 dark:text-stone-400">
          Revisa los reportes pendientes: descártalos, prográmalos como corte o márcalos urgentes.
        </p>
      </div>

      @if (reportes().length === 0) {
        <div
          class="rounded-xl border-2 border-dashed border-stone-300 bg-white/60 p-8 text-center dark:border-stone-700 dark:bg-stone-800/40"
        >
          <p class="text-base text-stone-600 dark:text-stone-400">Todavía no hay reportes.</p>
        </div>
      } @else {
        <ul class="flex flex-col gap-5">
          @for (reporte of reportes(); track reporte.id) {
            <li app-reporte-revision-card [reporte]="reporte"></li>
          }
        </ul>
      }
    </section>
  `,
})
export class AdminReportes {
  private readonly reportesService = inject(ReportesService);

  protected readonly reportes = toSignal(this.reportesService.todosLosReportes$(), {
    initialValue: [] as Reporte[],
  });
}
