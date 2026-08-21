/**
 * Colección "zonas" en Firestore: solo lectura, cargada manualmente en la
 * consola. Los valores son fijos, así que se listan acá para poblar
 * dropdowns/filtros sin depender de una lectura en vivo.
 */
export const ZONAS = [
  'Zona Central',
  'Zona Ferroviaria',
  'Zona Satélite',
  'Zona Norte',
  'Zona Sur',
  'Zona Industrial',
  'Zona Universitaria',
] as const;

export type Zona = (typeof ZONAS)[number];
