// Entidades federativas con su clave de 3 letras (usada en el folio RMX-{CLAVE}-...)
// y su posición en el mapa de mosaicos (columna, fila).
export interface Entidad {
  nombre: string;
  clave: string;
  col: number;
  fila: number;
}

export const ENTIDADES: Entidad[] = [
  { nombre: 'Baja California', clave: 'BCN', col: 0, fila: 0 },
  { nombre: 'Sonora', clave: 'SON', col: 1, fila: 0 },
  { nombre: 'Chihuahua', clave: 'CHH', col: 2, fila: 0 },
  { nombre: 'Coahuila', clave: 'COA', col: 3, fila: 0 },
  { nombre: 'Nuevo León', clave: 'NLE', col: 4, fila: 0 },
  { nombre: 'Baja California Sur', clave: 'BCS', col: 0, fila: 1 },
  { nombre: 'Sinaloa', clave: 'SIN', col: 1, fila: 1 },
  { nombre: 'Durango', clave: 'DUR', col: 2, fila: 1 },
  { nombre: 'Zacatecas', clave: 'ZAC', col: 3, fila: 1 },
  { nombre: 'San Luis Potosí', clave: 'SLP', col: 4, fila: 1 },
  { nombre: 'Tamaulipas', clave: 'TAM', col: 5, fila: 1 },
  { nombre: 'Nayarit', clave: 'NAY', col: 1, fila: 2 },
  { nombre: 'Jalisco', clave: 'JAL', col: 2, fila: 2 },
  { nombre: 'Aguascalientes', clave: 'AGS', col: 3, fila: 2 },
  { nombre: 'Guanajuato', clave: 'GTO', col: 4, fila: 2 },
  { nombre: 'Querétaro', clave: 'QRO', col: 5, fila: 2 },
  { nombre: 'Hidalgo', clave: 'HGO', col: 6, fila: 2 },
  { nombre: 'Colima', clave: 'COL', col: 1, fila: 3 },
  { nombre: 'Michoacán', clave: 'MIC', col: 2, fila: 3 },
  { nombre: 'Estado de México', clave: 'MEX', col: 3, fila: 3 },
  { nombre: 'Ciudad de México', clave: 'CMX', col: 4, fila: 3 },
  { nombre: 'Tlaxcala', clave: 'TLX', col: 5, fila: 3 },
  { nombre: 'Veracruz', clave: 'VER', col: 6, fila: 3 },
  { nombre: 'Yucatán', clave: 'YUC', col: 9, fila: 3 },
  { nombre: 'Guerrero', clave: 'GRO', col: 3, fila: 4 },
  { nombre: 'Morelos', clave: 'MOR', col: 4, fila: 4 },
  { nombre: 'Puebla', clave: 'PUE', col: 5, fila: 4 },
  { nombre: 'Tabasco', clave: 'TAB', col: 7, fila: 4 },
  { nombre: 'Campeche', clave: 'CAM', col: 8, fila: 4 },
  { nombre: 'Quintana Roo', clave: 'ROO', col: 9, fila: 4 },
  { nombre: 'Oaxaca', clave: 'OAX', col: 5, fila: 5 },
  { nombre: 'Chiapas', clave: 'CHP', col: 7, fila: 5 },
];

export const NOMBRES_ESTADOS = ENTIDADES.map((e) => e.nombre);

export function claveEstado(nombre: string): string | null {
  return ENTIDADES.find((e) => e.nombre === nombre)?.clave ?? null;
}
