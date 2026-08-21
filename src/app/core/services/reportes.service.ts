import { Injectable, inject } from '@angular/core';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { map, of, type Observable } from 'rxjs';

import { firestore, fromCollection } from '../firebase';
import type { EstadoReporte, Reporte } from '../models/reporte.model';
import { AuthService } from './auth.service';
import { CortesService, type DatosNuevoCorte } from './cortes.service';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly auth = inject(AuthService);
  private readonly cortes = inject(CortesService);

  async crearReporte(zona: string, descripcion: string): Promise<void> {
    const uid = this.auth.user()?.uid;
    if (!uid) {
      throw new Error('Debes iniciar sesión para reportar un corte.');
    }

    await addDoc(collection(firestore, 'reportes'), {
      zona,
      descripcion,
      reportadoPor: uid,
      fecha: serverTimestamp(),
      estado: 'pendiente',
      mensajeAdmin: null,
      revisadoPor: null,
    });
  }

  async eliminarReporte(reporteId: string): Promise<void> {
    const uid = this.auth.user()?.uid;
    if (!uid) {
      throw new Error('Debes iniciar sesión para eliminar un reporte.');
    }

    await deleteDoc(doc(firestore, 'reportes', reporteId));
  }

  /** Reportes propios del usuario autenticado, más recientes primero. */
  misReportes$(): Observable<Reporte[]> {
    const uid = this.auth.user()?.uid;
    if (!uid) {
      return of([]);
    }

    const q = query(collection(firestore, 'reportes'), where('reportadoPor', '==', uid));
    return fromCollection<Reporte>(q).pipe(map(ordenarPorFechaDesc));
  }

  /** Todos los reportes, para la bandeja de revisión del admin. */
  todosLosReportes$(): Observable<Reporte[]> {
    return fromCollection<Reporte>(collection(firestore, 'reportes')).pipe(
      map(ordenarPorFechaDesc),
    );
  }

  async descartarReporte(reporteId: string, mensajeAdmin: string | null): Promise<void> {
    await this.actualizarEstado(reporteId, 'descartado', mensajeAdmin);
  }

  /** Crea el corte programado y actualiza el reporte en una sola transacción,
   * para que un reporte nunca quede "programado" sin su corte asociado. */
  async programarComoCorte(
    reporteId: string,
    datos: DatosNuevoCorte,
    mensajeAdmin: string | null,
  ): Promise<void> {
    const adminUid = this.auth.user()?.uid;
    if (!adminUid) {
      throw new Error('Debes iniciar sesión como admin.');
    }
    if (this.cortes.tieneCorteActivoEnZona(datos.zona)) {
      throw new Error(`Ya hay un corte activo en ${datos.zona}.`);
    }

    const corteRef = doc(collection(firestore, 'cortes_programados'));
    const reporteRef = doc(firestore, 'reportes', reporteId);

    const batch = writeBatch(firestore);
    batch.set(corteRef, {
      zona: datos.zona,
      fechaInicio: Timestamp.fromDate(datos.fechaInicio),
      duracionEstimada: datos.duracionEstimada,
      detalles: datos.detalles ?? null,
      estado: 'programado',
      esUrgente: datos.esUrgente,
      creadoPor: adminUid,
      origenReporte: reporteId,
    });
    batch.update(reporteRef, {
      estado: 'programado',
      mensajeAdmin,
      revisadoPor: adminUid,
    });
    await batch.commit();
  }

  private async actualizarEstado(
    reporteId: string,
    estado: EstadoReporte,
    mensajeAdmin: string | null,
  ): Promise<void> {
    const adminUid = this.auth.user()?.uid;
    if (!adminUid) {
      throw new Error('Debes iniciar sesión como admin.');
    }

    await updateDoc(doc(firestore, 'reportes', reporteId), {
      estado,
      mensajeAdmin,
      revisadoPor: adminUid,
    });
  }
}

function ordenarPorFechaDesc(reportes: Reporte[]): Reporte[] {
  return [...reportes].sort((a, b) => b.fecha.toMillis() - a.fecha.toMillis());
}
