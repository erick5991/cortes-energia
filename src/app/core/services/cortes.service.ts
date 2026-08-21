import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Timestamp, addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { tap } from 'rxjs';

import { firestore, fromCollection } from '../firebase';
import type { CorteProgramado, EstadoCorte } from '../models/corte-programado.model';
import { AuthService } from './auth.service';

export interface DatosNuevoCorte {
  zona: string;
  fechaInicio: Date;
  duracionEstimada: string;
  esUrgente: boolean;
}

@Injectable({ providedIn: 'root' })
export class CortesService {
  private readonly auth = inject(AuthService);
  private readonly cargandoCortes = signal(true);

  private readonly cortes$ = fromCollection<CorteProgramado>(
    collection(firestore, 'cortes_programados'),
  ).pipe(tap(() => this.cargandoCortes.set(false)));

  readonly cortes = toSignal(this.cortes$, { initialValue: [] as CorteProgramado[] });

  /** true hasta que llega la primera respuesta de Firestore (para distinguir "cargando" de "vacío"). */
  readonly cargando = this.cargandoCortes.asReadonly();

  /** Cortes ordenados con los urgentes primero y luego por fecha de inicio. */
  readonly cortesOrdenados = computed(() =>
    [...this.cortes()].sort((a, b) => {
      if (a.esUrgente !== b.esUrgente) {
        return a.esUrgente ? -1 : 1;
      }
      return a.fechaInicio.toMillis() - b.fechaInicio.toMillis();
    }),
  );

  cortesPorZona(zona: string): CorteProgramado[] {
    return this.cortesOrdenados().filter((corte) => corte.zona === zona);
  }

  tieneCorteActivoEnZona(zona: string): boolean {
    return this.cortes().some((corte) => corte.zona === zona && corte.estado !== 'resuelto');
  }

  async crearCorte(datos: DatosNuevoCorte): Promise<void> {
    const adminUid = this.auth.user()?.uid;
    if (!adminUid) {
      throw new Error('Debes iniciar sesión como admin para crear un corte.');
    }
    if (this.tieneCorteActivoEnZona(datos.zona)) {
      throw new Error(`Ya hay un corte activo en ${datos.zona}.`);
    }

    await addDoc(collection(firestore, 'cortes_programados'), {
      zona: datos.zona,
      fechaInicio: Timestamp.fromDate(datos.fechaInicio),
      duracionEstimada: datos.duracionEstimada,
      estado: 'programado',
      esUrgente: datos.esUrgente,
      creadoPor: adminUid,
      origenReporte: null,
    });
  }

  /** El admin cambia el estado manualmente (ej. "resuelto"), sin relación
   * automática con duracionEstimada — es solo una referencia, no un timer. */
  async actualizarEstadoCorte(corteId: string, estado: EstadoCorte): Promise<void> {
    const adminUid = this.auth.user()?.uid;
    if (!adminUid) {
      throw new Error('Debes iniciar sesión como admin para actualizar un corte.');
    }

    await updateDoc(doc(firestore, 'cortes_programados', corteId), { estado });
  }
}
