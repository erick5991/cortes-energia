import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  ETIQUETA_POR_ESTADO_REPORTE,
  TONO_POR_ESTADO_REPORTE,
  type EstadoReporte,
  type Reporte,
} from '../../../core/models/reporte.model';
import { ReportesService } from '../../../core/services/reportes.service';
import { Badge, type TonoBadge } from '../../../shared/badge/badge';
import { Boton } from '../../../shared/boton/boton';
import { ConfirmacionModal } from '../../../shared/confirmacion-modal/confirmacion-modal';

@Component({
  selector: 'app-mis-reportes',
  imports: [DatePipe, Badge, Boton, ConfirmacionModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="titulo-mis-reportes" class="flex flex-col gap-8">
      <div>
        <span
          class="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-800 dark:bg-amber-900/30 dark:text-amber-300"
        >
          Tu actividad
        </span>
        <h1 id="titulo-mis-reportes" class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Mis reportes</h1>
        <span class="mt-3 block h-1.5 w-14 rounded-full bg-amber-400" aria-hidden="true"></span>
        <p class="mt-3 text-base text-stone-600 dark:text-stone-400">
          Reportes que enviaste y su estado de revisión.
        </p>
      </div>

      @if (errorEliminar()) {
        <p role="alert" class="text-sm text-red-700 dark:text-red-300">{{ errorEliminar() }}</p>
      }

      @if (reportes().length === 0) {
        <div
          class="rounded-xl border-2 border-dashed border-stone-300 bg-white/60 p-8 text-center dark:border-stone-700 dark:bg-stone-800/40"
        >
          <p class="text-base text-stone-600 dark:text-stone-400">Todavía no enviaste ningún reporte.</p>
        </div>
      } @else {
        <ul class="flex flex-col gap-5">
          @for (reporte of reportes(); track reporte.id) {
            <li class="rounded-xl bg-white p-6 shadow-sm dark:bg-stone-800">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-xl font-semibold">{{ reporte.zona }}</h2>
                <app-badge [texto]="etiquetaEstado(reporte.estado)" [tono]="tonoEstado(reporte.estado)" />
              </div>
              <p class="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {{ reporte.fecha.toDate() | date: 'medium' }}
              </p>
              <p class="mt-3 text-base text-stone-700 dark:text-stone-300">{{ reporte.descripcion }}</p>
              @if (reporte.mensajeAdmin) {
                <div
                  class="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                >
                  <p class="font-semibold">Mensaje del administrador</p>
                  <p class="mt-1">{{ reporte.mensajeAdmin }}</p>
                </div>
              }
              <div class="mt-4">
                <button
                  appBoton="peligro"
                  type="button"
                  [disabled]="eliminandoId() === reporte.id"
                  (click)="pedirEliminar(reporte, modalEliminarReporte)"
                >
                  Eliminar
                </button>
              </div>
            </li>
          }
        </ul>
      }
    </section>

    <app-confirmacion-modal
      #modalEliminarReporte
      titulo="Eliminar reporte"
      [mensaje]="mensajeConfirmacion()"
      (confirmado)="confirmarEliminar()"
    />
  `,
})
export class MisReportes {
  private readonly reportesService = inject(ReportesService);

  protected readonly reportes = toSignal(this.reportesService.misReportes$(), {
    initialValue: [] as Reporte[],
  });

  protected readonly eliminandoId = signal<string | null>(null);
  protected readonly errorEliminar = signal<string | null>(null);
  protected readonly reporteAEliminar = signal<Reporte | null>(null);

  protected readonly mensajeConfirmacion = computed(() =>
    this.reporteAEliminar() ? '¿Eliminar este reporte? Esta acción no se puede deshacer.' : '',
  );

  protected etiquetaEstado(estado: EstadoReporte): string {
    return ETIQUETA_POR_ESTADO_REPORTE[estado];
  }

  protected tonoEstado(estado: EstadoReporte): TonoBadge {
    return TONO_POR_ESTADO_REPORTE[estado];
  }

  protected pedirEliminar(reporte: Reporte, modal: ConfirmacionModal): void {
    this.reporteAEliminar.set(reporte);
    modal.abrir();
  }

  protected async confirmarEliminar(): Promise<void> {
    const reporte = this.reporteAEliminar();
    if (!reporte) {
      return;
    }

    this.errorEliminar.set(null);
    this.eliminandoId.set(reporte.id);
    try {
      await this.reportesService.eliminarReporte(reporte.id);
    } catch {
      this.errorEliminar.set('No se pudo eliminar el reporte. Intenta de nuevo.');
    } finally {
      this.eliminandoId.set(null);
      this.reporteAEliminar.set(null);
    }
  }
}
