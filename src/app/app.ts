import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

const CLASE_ITEM_NAV =
  'rounded-md px-3 py-1.5 font-medium hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-dvh bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100">
      <header class="bg-rose-900 text-white shadow-md dark:bg-rose-950">
        <div class="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a
            routerLink="/"
            class="text-2xl font-extrabold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            TRABAJOS PROGRAMADOS
          </a>
          <div class="flex items-center gap-3 text-sm">
            <nav class="flex items-center gap-1">
              @if (auth.esAdmin()) {
                <a routerLink="/admin/cortes" [class]="claseItemNav">Cortes</a>
                <a routerLink="/admin/reportes" [class]="claseItemNav">Reportes</a>
              } @else if (auth.estaAutenticado()) {
                <a routerLink="/mis-reportes" [class]="claseItemNav">Mis reportes</a>
              } @else {
                <a routerLink="/admin/login" [class]="claseItemNav">Admin login</a>
              }
              <button
                type="button"
                [class]="claseItemNav"
                [attr.aria-pressed]="theme.tema() === 'oscuro'"
                (click)="theme.alternar()"
              >
                {{ theme.tema() === 'oscuro' ? 'Modo claro' : 'Modo oscuro' }}
              </button>
            </nav>
            @if (auth.estaAutenticado()) {
              <div class="flex items-center gap-2 border-l border-white/20 pl-3">
                <span class="text-rose-100">{{ nombreUsuario() }}</span>
                <button type="button" [class]="claseItemNav" (click)="cerrarSesion()">
                  Cerrar sesión
                </button>
              </div>
            }
          </div>
        </div>
      </header>
      <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  protected readonly claseItemNav = CLASE_ITEM_NAV;

  protected readonly nombreUsuario = computed(
    () => this.auth.usuario()?.nombre ?? this.auth.user()?.displayName ?? this.auth.user()?.email ?? '',
  );

  protected async cerrarSesion(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/');
  }
}
