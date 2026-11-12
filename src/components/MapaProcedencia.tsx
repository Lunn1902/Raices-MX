import Link from 'next/link';
import { ENTIDADES } from '@/lib/estados';
import type { ConteoEstado } from '@/types';

// Mapa de mosaicos: cada estado es una casilla en su posición aproximada.
// Pesa casi nada en 3G y se lee bien desde 360 px, a diferencia de un SVG geográfico.
export function MapaProcedencia({ conteos, seleccionado }: { conteos: ConteoEstado[]; seleccionado?: string }) {
  const max = Math.max(1, ...conteos.map((c) => c.piezas));
  return (
    <section className="card">
      <h2 className="mb-1 font-semibold">Mapa nacional de procedencia</h2>
      <p className="mb-3 text-sm text-stone-600">Toca un estado para filtrar el catálogo.</p>
      <div className="grid grid-cols-10 gap-1">
        {ENTIDADES.map((e) => {
          const c = conteos.find((x) => x.estado === e.nombre);
          const activo = seleccionado === e.nombre;
          const titulo = c ? `${e.nombre}: ${c.productores} productores, ${c.piezas} piezas` : `${e.nombre}: sin productores aún`;
          const posicion = { gridColumnStart: e.col + 1, gridRowStart: e.fila + 1 };
          const clase = `flex aspect-square items-center justify-center rounded text-[9px] font-semibold sm:text-xs ${activo ? 'ring-2 ring-tinta' : ''}`;
          if (!c) {
            return (
              <span key={e.clave} title={titulo} style={posicion} className={`${clase} bg-stone-200 text-stone-500`}>
                {e.clave}
              </span>
            );
          }
          const opacidad = 0.35 + 0.65 * (c.piezas / max);
          return (
            <Link
              key={e.clave}
              title={titulo}
              style={{ ...posicion, backgroundColor: `rgb(47 107 59 / ${opacidad})` }}
              href={activo ? '/catalogo' : `/catalogo?estado=${encodeURIComponent(e.nombre)}`}
              className={`${clase} text-white hover:ring-2 hover:ring-milpa-oscuro`}
            >
              {e.clave}
            </Link>
          );
        })}
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {conteos.map((c) => (
          <li key={c.estado} className="flex justify-between gap-2">
            <span>{c.estado}</span>
            <span className="text-stone-600">
              {c.productores} productores · {c.piezas} piezas
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
