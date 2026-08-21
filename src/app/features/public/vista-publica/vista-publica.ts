import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ETIQUETA_POR_ESTADO_CORTE,
  TONO_POR_ESTADO_CORTE,
  type CorteProgramado,
  type EstadoCorte,
} from '../../../core/models/corte-programado.model';
import { AuthService } from '../../../core/services/auth.service';
import { CortesService } from '../../../core/services/cortes.service';
import { Boton } from '../../../shared/boton/boton';
import { ACENTO_POR_TONO, Badge, type TonoBadge } from '../../../shared/badge/badge';

@Component({
  selector: 'app-vista-publica',
  imports: [DatePipe, RouterLink, Badge, Boton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="titulo-vista-publica" class="flex flex-col gap-8">
      <div class="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span
            class="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-800 dark:bg-amber-900/30 dark:text-amber-300"
          >
            Servicio público
          </span>
          <h1 id="titulo-vista-publica" class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Cortes de Energia
          </h1>
          <span class="mt-3 block h-1.5 w-14 rounded-full bg-amber-400" aria-hidden="true"></span>
          <p class="mt-3 text-base text-stone-600 dark:text-stone-400">
            Estado de los cortes programados y en curso en la ciudad.
          </p>
        </div>
        @if (auth.estaAutenticado()) {
          <div class="flex shrink-0 gap-3">
            <a appBoton="primario" tamano="grande" routerLink="/reportar">Reportar corte</a>
            <a appBoton="secundario" tamano="grande" routerLink="/mis-reportes">Mis reportes</a>
          </div>
        } @else {
          <a
            appBoton="primario"
            tamano="grande"
            class="shrink-0"
            routerLink="/login"
            [queryParams]="{ returnUrl: '/reportar' }"
          >
            Reportar corte / Mis reportes
          </a>
        }
      </div>

      @if (cargando()) {
        <div
          class="rounded-xl border-2 border-dashed border-stone-300 bg-white/60 p-8 text-center dark:border-stone-700 dark:bg-stone-800/40"
        >
          <p class="text-base text-stone-600 dark:text-stone-400">Cargando…</p>
        </div>
      } @else if (cortes().length === 0) {
        <div
          class="rounded-xl border-2 border-dashed border-stone-300 bg-white/60 p-8 text-center dark:border-stone-700 dark:bg-stone-800/40"
        >
          <p class="text-base text-stone-600 dark:text-stone-400">No hay cortes programados en este momento.</p>
        </div>
      } @else {
        <ul class="flex flex-col gap-5">
          @for (corte of cortes(); track corte.id) {
            <li
              class="rounded-xl border-l-4 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              [class]="claseCard(corte)"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-xl font-semibold">{{ corte.zona }}</h2>
                <div class="flex gap-2">
                  @if (corte.esUrgente) {
                    <app-badge texto="URGENTE" tono="urgente" />
                  }
                  <app-badge [texto]="etiquetaEstado(corte.estado)" [tono]="tonoEstado(corte.estado)" />
                </div>
              </div>
              <dl class="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-base text-stone-700 dark:text-stone-300">
                <dt class="text-stone-500 dark:text-stone-400">Inicio</dt>
                <dd>{{ corte.fechaInicio.toDate() | date: 'medium' }}</dd>
                <dt class="text-stone-500 dark:text-stone-400">Duración estimada</dt>
                <dd>{{ corte.duracionEstimada }}</dd>
              </dl>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class VistaPublica {
  protected readonly auth = inject(AuthService);
  private readonly cortesService = inject(CortesService);

  protected readonly cortes = this.cortesService.cortesOrdenados;
  protected readonly cargando = this.cortesService.cargando;

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
