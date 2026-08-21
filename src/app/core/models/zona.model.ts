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

/** Calles y establecimientos de referencia por zona (Potosí), para orientar
 * a quien reporta o consulta un corte. Fijo, igual que ZONAS. */
export const CALLES_POR_ZONA: Record<Zona, readonly string[]> = {
  'Zona Central': ['Calle Bolívar', 'Calle Sucre', 'Calle Junín', 'Plaza 10 de Noviembre', 'Catedral de Potosí'],
  'Zona Ferroviaria': [
    'Calle La Paz',
    'Calle Oruro',
    'Calle Chayanta',
    'Hospital Obrero',
    'Estación de Ferrocarril',
  ],
  'Zona Satélite': ['Av. Circunvalación', 'Calle Antofagasta', 'Urbanización Satélite', 'Colegio San Agustín'],
  'Zona Norte': [
    'Av. Universitaria',
    'Calle Linares',
    'Universidad Autónoma Tomás Frías',
    'Hospital Daniel Bracamonte',
  ],
  'Zona Sur': ['Calle Camacho', 'Calle Bustillos', 'Terminal de Buses', 'Mercado Central'],
  'Zona Industrial': ['Av. Circunvalación Industrial', 'Ingenio San Marcos', 'Zona Franca', 'Calle Chuquisaca'],
  'Zona Universitaria': ['Ciudad Universitaria', 'Calle Quijarro', 'Facultad de Ingeniería', 'Colegio Pichincha'],
};

/** `corte.zona`/`reporte.zona` son `string` (vienen de Firestore), no `Zona`,
 * así que la búsqueda es segura ante valores que no estén en el mapa. */
export function callesDeZona(zona: string): readonly string[] {
  return CALLES_POR_ZONA[zona as Zona] ?? [];
}
