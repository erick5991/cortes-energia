import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import {
  ETIQUETA_POR_ESTADO_REPORTE,
  TONO_POR_ESTADO_REPORTE,
  type Reporte,
} from '../../../core/models/reporte.model';
import { ReportesService } from '../../../core/services/reportes.service';
import { Badge } from '../../../shared/badge/badge';
import { Boton } from '../../../shared/boton/boton';

@Component({
  selector: 'li[app-reporte-revision-card]',
  imports: [DatePipe, ReactiveFormsModule, Badge, Boton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rounded-xl bg-white p-5 shadow-sm dark:bg-slate-800',
  },
  template: `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 class="text-lg font-semibold">{{ reporte().zona }}</h3>
        <app-badge [texto]="etiqueta()" [tono]="tono()" />
      </div>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {{ reporte().fecha.toDate() | date: 'medium' }}
      </p>
      <p class="mt-3 text-base text-slate-700 dark:text-slate-300">{{ reporte().descripcion }}</p>

      @if (reporte().mensajeAdmin) {
        <div
          class="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
        >
          <p class="font-semibold">Tu mensaje al usuario</p>
          <p class="mt-1">{{ reporte().mensajeAdmin }}</p>
        </div>
      }

      @if (reporte().estado === 'pendiente') {
        @if (error()) {
          <p role="alert" class="mt-3 text-sm text-red-700 dark:text-red-300">{{ error() }}</p>
        }

        <form class="mt-4 flex flex-col gap-3" [formGroup]="formulario">
          <div class="flex flex-col gap-1">
            <label [for]="'mensaje-' + reporte().id" class="text-sm font-medium">
              Mensaje para el usuario (opcional)
            </label>
            <textarea
              [id]="'mensaje-' + reporte().id"
              formControlName="mensajeAdmin"
              rows="2"
              class="rounded-md border border-slate-500 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-slate-700 dark:text-slate-100"
            ></textarea>
          </div>

          @if (mostrandoFormularioCorte()) {
            <div class="flex flex-col gap-3 rounded-lg border border-slate-300 p-3 dark:border-slate-600">
              <div class="flex flex-col gap-1">
                <label [for]="'fecha-' + reporte().id" class="text-sm font-medium">Fecha y hora de inicio</label>
                <input
                  [id]="'fecha-' + reporte().id"
                  type="datetime-local"
                  formControlName="fechaInicio"
                  class="rounded-md border border-slate-500 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label [for]="'duracion-' + reporte().id" class="text-sm font-medium">Duración estimada</label>
                <input
                  [id]="'duracion-' + reporte().id"
                  type="text"
                  placeholder="Ej: 2 horas"
                  formControlName="duracionEstimada"
                  class="rounded-md border border-slate-500 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div class="flex items-center gap-2">
                <input
                  [id]="'urgente-' + reporte().id"
                  type="checkbox"
                  formControlName="esUrgente"
                  class="h-4 w-4 rounded accent-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                />
                <label [for]="'urgente-' + reporte().id" class="text-sm font-medium">Marcar como urgente</label>
              </div>
              <div class="flex gap-2">
                <button
                  appBoton="primario"
                  type="button"
                  [disabled]="procesando()"
                  (click)="confirmarProgramar()"
                >
                  {{ procesando() ? 'Programando…' : 'Confirmar programación' }}
                </button>
                <button
                  appBoton="secundario"
                  type="button"
                  [disabled]="procesando()"
                  (click)="mostrandoFormularioCorte.set(false)"
                >
                  Cancelar
                </button>
              </div>
            </div>
          } @else {
            <div class="flex flex-wrap gap-2">
              <button
                appBoton="secundario"
                type="button"
                [disabled]="procesando()"
                (click)="descartar()"
              >
                Descartar
              </button>
              <button
                appBoton="secundario"
                type="button"
                [disabled]="procesando()"
                (click)="mostrandoFormularioCorte.set(true)"
              >
                Programar como corte
              </button>
              <button
                appBoton="secundario"
                type="button"
                [disabled]="procesando()"
                (click)="marcarUrgente()"
              >
                Marcar urgente
              </button>
            </div>
          }
        </form>
      }
  `,
})
export class ReporteRevisionCard {
  private readonly reportesService = inject(ReportesService);

  readonly reporte = input.required<Reporte>();

  protected readonly mostrandoFormularioCorte = signal(false);
  protected readonly procesando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = new FormGroup({
    mensajeAdmin: new FormControl('', { nonNullable: true }),
    fechaInicio: new FormControl('', { nonNullable: true }),
    duracionEstimada: new FormControl('', { nonNullable: true }),
    esUrgente: new FormControl(false, { nonNullable: true }),
  });

  protected etiqueta(): string {
    return ETIQUETA_POR_ESTADO_REPORTE[this.reporte().estado];
  }

  protected tono() {
    return TONO_POR_ESTADO_REPORTE[this.reporte().estado];
  }

  protected async descartar(): Promise<void> {
    await this.ejecutar(() =>
      this.reportesService.descartarReporte(this.reporte().id, this.mensajeOpcional()),
    );
  }

  protected async marcarUrgente(): Promise<void> {
    await this.ejecutar(() =>
      this.reportesService.marcarUrgente(this.reporte().id, this.mensajeOpcional()),
    );
  }

  protected async confirmarProgramar(): Promise<void> {
    const { fechaInicio, duracionEstimada, esUrgente } = this.formulario.getRawValue();
    if (!fechaInicio || !duracionEstimada) {
      this.error.set('Completa fecha de inicio y duración estimada.');
      return;
    }

    await this.ejecutar(() =>
      this.reportesService.programarComoCorte(
        this.reporte().id,
        { zona: this.reporte().zona, fechaInicio: new Date(fechaInicio), duracionEstimada, esUrgente },
        this.mensajeOpcional(),
      ),
    );
  }

  private mensajeOpcional(): string | null {
    const mensaje = this.formulario.controls.mensajeAdmin.value.trim();
    return mensaje.length > 0 ? mensaje : null;
  }

  private async ejecutar(accion: () => Promise<void>): Promise<void> {
    this.error.set(null);
    this.procesando.set(true);
    try {
      await accion();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo completar la acción.');
    } finally {
      this.procesando.set(false);
    }
  }
}
