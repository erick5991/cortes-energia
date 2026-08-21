import type { Timestamp } from 'firebase/firestore';

import type { TonoBadge } from '../../shared/badge/badge';

export type EstadoReporte = 'pendiente' | 'descartado' | 'programado';

export interface Reporte {
  id: string;
  zona: string;
  descripcion: string;
  reportadoPor: string;
  fecha: Timestamp;
  estado: EstadoReporte;
  mensajeAdmin: string | null;
  revisadoPor: string | null;
}

export const TONO_POR_ESTADO_REPORTE: Record<EstadoReporte, TonoBadge> = {
  pendiente: 'atencion',
  descartado: 'neutro',
  programado: 'info',
};

export const ETIQUETA_POR_ESTADO_REPORTE: Record<EstadoReporte, string> = {
  pendiente: 'Pendiente',
  descartado: 'Descartado',
  programado: 'Programado',
};
