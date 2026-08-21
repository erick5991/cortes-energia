import type { Timestamp } from 'firebase/firestore';

import type { TonoBadge } from '../../shared/badge/badge';

export type EstadoCorte = 'programado' | 'en curso' | 'resuelto';

export interface CorteProgramado {
  id: string;
  zona: string;
  fechaInicio: Timestamp;
  duracionEstimada: string;
  estado: EstadoCorte;
  esUrgente: boolean;
  creadoPor: string;
  origenReporte: string | null;
}

export const TONO_POR_ESTADO_CORTE: Record<EstadoCorte, TonoBadge> = {
  programado: 'info',
  'en curso': 'atencion',
  resuelto: 'exito',
};

export const ETIQUETA_POR_ESTADO_CORTE: Record<EstadoCorte, string> = {
  programado: 'Programado',
  'en curso': 'En curso',
  resuelto: 'Resuelto',
};
