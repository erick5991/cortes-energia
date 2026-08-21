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
        <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          Panel admin
        </p>
        <h1 id="titulo-admin-reportes" class="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Reportes de usuarios
        </h1>
        <p class="mt-2 text-base text-slate-600 dark:text-slate-400">
          Revisa los reportes pendientes: descártalos, prográmalos como corte o márcalos urgentes.
        </p>
      </div>

      @if (reportes().length === 0) {
        <div
          class="rounded-xl border-2 border-dashed border-slate-300 bg-white/60 p-8 text-center dark:border-slate-700 dark:bg-slate-800/40"
        >
          <p class="text-base text-slate-600 dark:text-slate-400">Todavía no hay reportes.</p>
        </div>
      } @else {
        <ul class="flex flex-col gap-4">
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
