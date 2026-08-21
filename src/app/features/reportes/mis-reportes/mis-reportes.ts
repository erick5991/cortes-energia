import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  ETIQUETA_POR_ESTADO_REPORTE,
  TONO_POR_ESTADO_REPORTE,
  type EstadoReporte,
  type Reporte,
} from '../../../core/models/reporte.model';
import { ReportesService } from '../../../core/services/reportes.service';
import { Badge, type TonoBadge } from '../../../shared/badge/badge';

@Component({
  selector: 'app-mis-reportes',
  imports: [DatePipe, Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="titulo-mis-reportes" class="flex flex-col gap-8">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          Tu actividad
        </p>
        <h1 id="titulo-mis-reportes" class="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Mis reportes</h1>
        <p class="mt-2 text-base text-slate-600 dark:text-slate-400">
          Reportes que enviaste y su estado de revisión.
        </p>
      </div>

      @if (reportes().length === 0) {
        <div
          class="rounded-xl border-2 border-dashed border-slate-300 bg-white/60 p-8 text-center dark:border-slate-700 dark:bg-slate-800/40"
        >
          <p class="text-base text-slate-600 dark:text-slate-400">Todavía no enviaste ningún reporte.</p>
        </div>
      } @else {
        <ul class="flex flex-col gap-4">
          @for (reporte of reportes(); track reporte.id) {
            <li class="rounded-xl bg-white p-5 shadow-sm dark:bg-slate-800">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-lg font-semibold">{{ reporte.zona }}</h2>
                <app-badge [texto]="etiquetaEstado(reporte.estado)" [tono]="tonoEstado(reporte.estado)" />
              </div>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {{ reporte.fecha.toDate() | date: 'medium' }}
              </p>
              <p class="mt-3 text-base text-slate-700 dark:text-slate-300">{{ reporte.descripcion }}</p>
              @if (reporte.mensajeAdmin) {
                <div
                  class="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
                >
                  <p class="font-semibold">Mensaje del administrador</p>
                  <p class="mt-1">{{ reporte.mensajeAdmin }}</p>
                </div>
              }
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class MisReportes {
  private readonly reportesService = inject(ReportesService);

  protected readonly reportes = toSignal(this.reportesService.misReportes$(), {
    initialValue: [] as Reporte[],
  });

  protected etiquetaEstado(estado: EstadoReporte): string {
    return ETIQUETA_POR_ESTADO_REPORTE[estado];
  }

  protected tonoEstado(estado: EstadoReporte): TonoBadge {
    return TONO_POR_ESTADO_REPORTE[estado];
  }
}
