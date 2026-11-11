import type { ConteoEstado, PiezaCatalogo, Productor } from '@/types';

// Misma lógica que la vista vista_mapa_procedencia, para el modo con datos locales
export function agregarPorEstado(productores: Productor[], piezas: PiezaCatalogo[]): ConteoEstado[] {
  const mapa = new Map<string, ConteoEstado>();
  for (const p of productores) {
    if (p.estado_verificacion !== 'aprobado') continue;
    const fila = mapa.get(p.estado) ?? { estado: p.estado, productores: 0, piezas: 0 };
    fila.productores += 1;
    fila.piezas += piezas.filter((x) => x.productor_id === p.id).length;
    mapa.set(p.estado, fila);
  }
  return [...mapa.values()].sort((a, b) => b.piezas - a.piezas);
}
