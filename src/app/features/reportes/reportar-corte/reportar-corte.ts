import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ZONAS } from '../../../core/models/zona.model';
import { ReportesService } from '../../../core/services/reportes.service';
import { Boton } from '../../../shared/boton/boton';

@Component({
  selector: 'app-reportar-corte',
  imports: [ReactiveFormsModule, RouterLink, Boton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="titulo-reportar" class="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <span
          class="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-800 dark:bg-amber-900/30 dark:text-amber-300"
        >
          Nuevo reporte
        </span>
        <h1 id="titulo-reportar" class="mt-3 text-3xl font-extrabold tracking-tight">Reportar un corte</h1>
        <span class="mt-3 block h-1.5 w-14 rounded-full bg-amber-400" aria-hidden="true"></span>
        <p class="mt-3 text-base text-stone-600 dark:text-stone-400">
          Cuéntanos qué está pasando en tu zona. Un administrador va a revisar tu reporte.
        </p>
      </div>

      @if (enviado()) {
        <div
          role="status"
          class="rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200"
        >
          Reporte enviado. Puedes revisar su estado en
          <a routerLink="/mis-reportes" class="font-semibold underline underline-offset-2">Mis reportes</a>.
        </div>
      }

      @if (error()) {
        <p role="alert" class="text-sm text-red-700 dark:text-red-300">{{ error() }}</p>
      }

      <form class="flex flex-col gap-4" [formGroup]="formulario" (ngSubmit)="enviar()">
        <div class="flex flex-col gap-1">
          <label for="zona" class="text-sm font-medium">Zona</label>
          <select
            id="zona"
            formControlName="zona"
            class="rounded-md border border-stone-500 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 dark:bg-stone-800 dark:text-stone-100"
            [attr.aria-invalid]="campoInvalido('zona')"
            [attr.aria-describedby]="campoInvalido('zona') ? 'zona-error' : null"
          >
            <option value="" disabled>Elige una zona</option>
            @for (zona of zonas; track zona) {
              <option [value]="zona">{{ zona }}</option>
            }
          </select>
          @if (campoInvalido('zona')) {
            <p id="zona-error" role="alert" class="text-sm text-red-700 dark:text-red-300">Elige una zona.</p>
          }
        </div>

        <div class="flex flex-col gap-1">
          <label for="descripcion" class="text-sm font-medium">Descripción</label>
          <textarea
            id="descripcion"
            formControlName="descripcion"
            rows="4"
            class="rounded-md border border-stone-500 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 dark:bg-stone-800 dark:text-stone-100"
            [attr.aria-invalid]="campoInvalido('descripcion')"
            [attr.aria-describedby]="campoInvalido('descripcion') ? 'descripcion-error' : null"
          ></textarea>
          @if (campoInvalido('descripcion')) {
            <p id="descripcion-error" role="alert" class="text-sm text-red-700 dark:text-red-300">
              Describe brevemente qué está pasando (máx. 500 caracteres).
            </p>
          }
        </div>

        <button appBoton="primario" type="submit" [disabled]="enviando()">
          {{ enviando() ? 'Enviando…' : 'Enviar reporte' }}
        </button>
      </form>
    </section>
  `,
})
export class ReportarCorte {
  private readonly reportesService = inject(ReportesService);

  protected readonly zonas = ZONAS;
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly enviado = signal(false);

  protected readonly formulario = new FormGroup({
    zona: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });

  protected campoInvalido(campo: 'zona' | 'descripcion'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  protected async enviar(): Promise<void> {
    this.error.set(null);
    this.enviado.set(false);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const { zona, descripcion } = this.formulario.getRawValue();
    try {
      await this.reportesService.crearReporte(zona, descripcion);
      this.formulario.reset({ zona: '', descripcion: '' });
      this.enviado.set(true);
    } catch {
      this.error.set('No se pudo enviar el reporte. Intenta de nuevo.');
    } finally {
      this.enviando.set(false);
    }
  }
}
