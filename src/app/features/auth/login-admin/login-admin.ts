import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { Boton } from '../../../shared/boton/boton';

@Component({
  selector: 'app-login-admin',
  imports: [ReactiveFormsModule, Boton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="titulo-login-admin" class="mx-auto flex max-w-sm flex-col gap-4">
      <div>
        <h1 id="titulo-login-admin" class="text-2xl font-semibold tracking-tight">Ingreso de administrador</h1>
        <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Acceso con email y contraseña para el personal autorizado.
        </p>
      </div>

      @if (error()) {
        <p role="alert" class="text-sm text-red-700 dark:text-red-300">{{ error() }}</p>
      }

      <form class="flex flex-col gap-4" [formGroup]="formulario" (ngSubmit)="ingresar()">
        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            autocomplete="username"
            formControlName="email"
            class="rounded-md border border-neutral-500 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
            [attr.aria-invalid]="campoInvalido('email')"
            [attr.aria-describedby]="campoInvalido('email') ? 'email-error' : null"
          />
          @if (campoInvalido('email')) {
            <p id="email-error" role="alert" class="text-sm text-red-700 dark:text-red-300">
              Ingresa un email válido.
            </p>
          }
        </div>

        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium">Contraseña</label>
          <input
            id="password"
            type="password"
            autocomplete="current-password"
            formControlName="password"
            class="rounded-md border border-neutral-500 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
            [attr.aria-invalid]="campoInvalido('password')"
            [attr.aria-describedby]="campoInvalido('password') ? 'password-error' : null"
          />
          @if (campoInvalido('password')) {
            <p id="password-error" role="alert" class="text-sm text-red-700 dark:text-red-300">
              Ingresa tu contraseña.
            </p>
          }
        </div>

        <button appBoton="primario" type="submit" [disabled]="cargando()">
          {{ cargando() ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>
    </section>
  `,
})
export class LoginAdmin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected campoInvalido(campo: 'email' | 'password'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  protected async ingresar(): Promise<void> {
    this.error.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const { email, password } = this.formulario.getRawValue();
    try {
      await this.auth.iniciarSesionAdmin(email, password);
      await this.router.navigateByUrl('/');
    } catch {
      this.error.set('Email o contraseña incorrectos.');
    } finally {
      this.cargando.set(false);
    }
  }
}
