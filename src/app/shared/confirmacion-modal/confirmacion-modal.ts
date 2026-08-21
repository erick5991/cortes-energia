import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';

import { Boton } from '../boton/boton';

let contadorId = 0;

@Component({
  selector: 'app-confirmacion-modal',
  imports: [Boton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialogRef
      class="m-auto w-full max-w-sm rounded-xl bg-white p-6 text-neutral-900 shadow-lg backdrop:bg-neutral-900/50 dark:bg-neutral-800 dark:text-neutral-100"
      [attr.aria-labelledby]="tituloId"
      (cancel)="cerrar()"
      (click)="onClickFondo($event)"
    >
      <h2 [id]="tituloId" class="text-lg font-semibold">{{ titulo() }}</h2>
      <p class="mt-2 text-base text-neutral-600 dark:text-neutral-400">{{ mensaje() }}</p>
      <div class="mt-6 flex justify-end gap-3">
        <button appBoton="secundario" type="button" (click)="cerrar()">Cancelar</button>
        <button appBoton="peligro" type="button" (click)="confirmar()">{{ textoConfirmar() }}</button>
      </div>
    </dialog>
  `,
})
export class ConfirmacionModal {
  readonly titulo = input.required<string>();
  readonly mensaje = input.required<string>();
  readonly textoConfirmar = input('Eliminar');

  readonly confirmado = output<void>();

  protected readonly tituloId = `confirmacion-modal-${contadorId++}-titulo`;

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  abrir(): void {
    this.dialogRef().nativeElement.showModal();
  }

  protected cerrar(): void {
    this.dialogRef().nativeElement.close();
  }

  protected confirmar(): void {
    this.dialogRef().nativeElement.close();
    this.confirmado.emit();
  }

  /** El backdrop nativo del <dialog> es el propio elemento; si el click cae ahí (no en su contenido), se cierra. */
  protected onClickFondo(event: MouseEvent): void {
    if (event.target === this.dialogRef().nativeElement) {
      this.cerrar();
    }
  }
}
