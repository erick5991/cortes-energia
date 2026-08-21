import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  ETIQUETA_POR_ESTADO_CORTE,
  TONO_POR_ESTADO_CORTE,
  type CorteProgramado,
  type EstadoCorte,
} from '../../../core/models/corte-programado.model';
import { ZONAS } from '../../../core/models/zona.model';
import { CortesService } from '../../../core/services/cortes.service';
import { ACENTO_POR_TONO, Badge, type TonoBadge } from '../../../shared/badge/badge';
import { Boton } from '../../../shared/boton/boton';
import { ConfirmacionModal } from '../../../shared/confirmacion-modal/confirmacion-modal';

@Component({
  selector: 'app-admin-cortes',
  imports: [DatePipe, ReactiveFormsModule, Badge, Boton, ConfirmacionModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="titulo-admin-cortes" class="flex flex-col gap-8">
      <div>
        <span
          class="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-800 dark:bg-amber-900/30 dark:text-amber-300"
        >
          Panel admin
        </span>
        <h1 id="titulo-admin-cortes" class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Cortes programados
        </h1>
        <span class="mt-3 block h-1.5 w-14 rounded-full bg-amber-400" aria-hidden="true"></span>
      </div>

      <div class="rounded-xl bg-white p-6 shadow-sm dark:bg-stone-800">
        <h2 class="text-xl font-semibold">Crear corte</h2>

        @if (errorFormulario()) {
          <p role="alert" class="mt-3 text-sm text-red-700 dark:text-red-300">{{ errorFormulario() }}</p>
        }
        @if (creado()) {
          <p role="status" class="mt-3 text-sm text-green-700 dark:text-green-300">Corte creado.</p>
        }

        <form class="mt-4 flex flex-col gap-4" [formGroup]="formulario" (ngSubmit)="crear()">
          <div class="flex flex-col gap-1">
            <label for="zona" class="text-sm font-medium">Zona</label>
            <select
              id="zona"
              formControlName="zona"
              class="rounded-md border border-stone-500 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 dark:bg-stone-700 dark:text-stone-100"
              [attr.aria-invalid]="campoInvalido('zona')"
            >
              <option value="" disabled>Elige una zona</option>
              @for (zona of zonas; track zona) {
                <option [value]="zona">{{ zona }}</option>
              }
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label for="fechaInicio" class="text-sm font-medium">Fecha y hora de inicio</label>
            <input
              id="fechaInicio"
              type="datetime-local"
              formControlName="fechaInicio"
              class="rounded-md border border-stone-500 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 dark:bg-stone-700 dark:text-stone-100"
              [attr.aria-invalid]="campoInvalido('fechaInicio')"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label for="duracionEstimada" class="text-sm font-medium">Duración estimada</label>
            <input
              id="duracionEstimada"
              type="text"
              placeholder="Ej: 2 horas"
              formControlName="duracionEstimada"
              class="rounded-md border border-stone-500 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 dark:bg-stone-700 dark:text-stone-100"
              [attr.aria-invalid]="campoInvalido('duracionEstimada')"
            />
          </div>

          <div class="flex items-center gap-2">
            <input
              id="esUrgente"
              type="checkbox"
              formControlName="esUrgente"
              class="h-4 w-4 rounded accent-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
            />
            <label for="esUrgente" class="text-sm font-medium">Marcar como urgente</label>
          </div>

          <button appBoton="primario" type="submit" class="self-start" [disabled]="creando()">
            {{ creando() ? 'Creando…' : 'Crear corte' }}
          </button>
        </form>
      </div>

      <div class="flex flex-col gap-4">
        <h2 class="text-lg font-semibold">Cortes existentes</h2>

        @if (errorAccion()) {
          <p role="alert" class="text-sm text-red-700 dark:text-red-300">{{ errorAccion() }}</p>
        }

        @if (cortes().length === 0) {
          <p class="text-base text-stone-600 dark:text-stone-400">Todavía no hay cortes cargados.</p>
        } @else {
          <ul class="flex flex-col gap-5">
            @for (corte of cortes(); track corte.id) {
              <li class="rounded-xl border-l-4 p-6 shadow-sm" [class]="claseCard(corte)">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h3 class="text-xl font-semibold">{{ corte.zona }}</h3>
                  <div class="flex gap-2">
                    @if (corte.esUrgente) {
                      <app-badge texto="URGENTE" tono="urgente" />
                    }
                    <app-badge [texto]="etiquetaEstado(corte.estado)" [tono]="tonoEstado(corte.estado)" />
                  </div>
                </div>
                <dl
                  class="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-base text-stone-700 dark:text-stone-300"
                >
                  <dt class="text-stone-500 dark:text-stone-400">Inicio</dt>
                  <dd>{{ corte.fechaInicio.toDate() | date: 'medium' }}</dd>
                  <dt class="text-stone-500 dark:text-stone-400">Duración estimada</dt>
                  <dd>{{ corte.duracionEstimada }}</dd>
                </dl>

                <div class="mt-4 flex flex-wrap gap-2">
                  @if (corte.estado === 'programado') {
                    <button
                      appBoton="secundario"
                      type="button"
                      [disabled]="actualizandoId() === corte.id"
                      (click)="marcarEstado(corte, 'en curso')"
                    >
                      Marcar en curso
                    </button>
                  }
                  @if (corte.estado !== 'resuelto') {
                    <button
                      appBoton="secundario"
                      type="button"
                      [disabled]="actualizandoId() === corte.id"
                      (click)="marcarEstado(corte, 'resuelto')"
                    >
                      Marcar resuelto
                    </button>
                  }
                  <button
                    appBoton="peligro"
                    type="button"
                    [disabled]="actualizandoId() === corte.id"
                    (click)="pedirEliminar(corte, modalEliminarCorte)"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            }
          </ul>
        }
      </div>
    </section>

    <app-confirmacion-modal
      #modalEliminarCorte
      titulo="Eliminar corte"
      [mensaje]="mensajeConfirmacion()"
      (confirmado)="confirmarEliminar()"
    />
  `,
})
export class AdminCortes {
  private readonly cortesService = inject(CortesService);

  protected readonly zonas = ZONAS;
  protected readonly cortes = this.cortesService.cortesOrdenados;

  protected readonly creando = signal(false);
  protected readonly creado = signal(false);
  protected readonly errorFormulario = signal<string | null>(null);

  protected readonly actualizandoId = signal<string | null>(null);
  protected readonly errorAccion = signal<string | null>(null);
  protected readonly corteAEliminar = signal<CorteProgramado | null>(null);

  protected readonly mensajeConfirmacion = computed(() => {
    const corte = this.corteAEliminar();
    return corte
      ? `¿Eliminar el corte en ${corte.zona}? Esta acción no se puede deshacer.`
      : '';
  });

  protected readonly formulario = new FormGroup({
    zona: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fechaInicio: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    duracionEstimada: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    esUrgente: new FormControl(false, { nonNullable: true }),
  });

  protected campoInvalido(campo: 'zona' | 'fechaInicio' | 'duracionEstimada'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  protected async crear(): Promise<void> {
    this.errorFormulario.set(null);
    this.creado.set(false);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.creando.set(true);
    const { zona, fechaInicio, duracionEstimada, esUrgente } = this.formulario.getRawValue();
    try {
      await this.cortesService.crearCorte({
        zona,
        fechaInicio: new Date(fechaInicio),
        duracionEstimada,
        esUrgente,
      });
      this.formulario.reset({ zona: '', fechaInicio: '', duracionEstimada: '', esUrgente: false });
      this.creado.set(true);
    } catch (error) {
      this.errorFormulario.set(error instanceof Error ? error.message : 'No se pudo crear el corte.');
    } finally {
      this.creando.set(false);
    }
  }

  protected async marcarEstado(corte: CorteProgramado, estado: EstadoCorte): Promise<void> {
    this.errorAccion.set(null);
    this.actualizandoId.set(corte.id);
    try {
      await this.cortesService.actualizarEstadoCorte(corte.id, estado);
    } catch {
      this.errorAccion.set('No se pudo actualizar el corte. Intenta de nuevo.');
    } finally {
      this.actualizandoId.set(null);
    }
  }

  protected pedirEliminar(corte: CorteProgramado, modal: ConfirmacionModal): void {
    this.corteAEliminar.set(corte);
    modal.abrir();
  }

  protected async confirmarEliminar(): Promise<void> {
    const corte = this.corteAEliminar();
    if (!corte) {
      return;
    }

    this.errorAccion.set(null);
    this.actualizandoId.set(corte.id);
    try {
      await this.cortesService.eliminarCorte(corte.id);
    } catch {
      this.errorAccion.set('No se pudo eliminar el corte. Intenta de nuevo.');
    } finally {
      this.actualizandoId.set(null);
      this.corteAEliminar.set(null);
    }
  }

  protected etiquetaEstado(estado: EstadoCorte): string {
    return ETIQUETA_POR_ESTADO_CORTE[estado];
  }

  protected tonoEstado(estado: EstadoCorte): TonoBadge {
    return TONO_POR_ESTADO_CORTE[estado];
  }

  protected claseCard(corte: CorteProgramado): string {
    const acento = corte.esUrgente ? ACENTO_POR_TONO.urgente : ACENTO_POR_TONO[TONO_POR_ESTADO_CORTE[corte.estado]];
    const fondo = corte.esUrgente ? 'bg-red-50/70 dark:bg-red-950/20' : 'bg-white dark:bg-stone-800';
    return `${acento} ${fondo}`;
  }
}
