import Link from 'next/link';
import { Search } from 'lucide-react';
import { MapaProcedencia } from '@/components/MapaProcedencia';
import { TarjetaPieza } from '@/components/TarjetaPieza';
import { repo } from '@/lib/repositorio';
import { buscarCatalogo, opcionesFiltros } from '@/modules/catalogo/servicio';
import { leerFiltros } from '@/modules/catalogo/filtros';
import { CATEGORIAS } from '@/types';

// siempre se consulta la base al momento: existencias y firmas cambian
export const instant = false;

export const metadata = { title: 'Catálogo' };

// CU-07: el formulario usa GET, así los filtros quedan en la URL y se pueden compartir
export default async function Catalogo({ searchParams }: PageProps<'/catalogo'>) {
  const filtros = leerFiltros(await searchParams);
  const [piezas, opciones, conteos] = await Promise.all([buscarCatalogo(filtros), opcionesFiltros(), repo().conteoPorEstado()]);
  const hayFiltros = Object.values(filtros).some((v) => v !== undefined);

  const select = (name: string, etiqueta: string, valores: readonly string[], valor?: string) => (
    <label className="block">
      <span className="label">{etiqueta}</span>
      <select name={name} defaultValue={valor ?? ''} className="input">
        <option value="">Todos</option>
        {valores.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <form className="card space-y-3" action="/catalogo">
          <label className="block">
            <span className="label">Buscar</span>
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-stone-400" />
              <input name="q" defaultValue={filtros.q} placeholder="huipil, barro, palma..." className="input pl-9" />
            </div>
          </label>
          {select('categoria', 'Categoría', CATEGORIAS, filtros.categoria)}
          {select('estado', 'Estado', opciones.estados, filtros.estado)}
          {select('pueblo', 'Pueblo originario', opciones.pueblos, filtros.pueblo)}
          {select('tecnica', 'Técnica', opciones.tecnicas, filtros.tecnica)}
          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="label">Precio mín.</span>
              <input name="min" type="number" min={0} defaultValue={filtros.precioMin} className="input" />
            </label>
            <label>
              <span className="label">Precio máx.</span>
              <input name="max" type="number" min={0} defaultValue={filtros.precioMax} className="input" />
            </label>
          </div>
          <div className="flex gap-2">
            <button className="btn flex-1">Aplicar filtros</button>
            {hayFiltros && (
              <Link href="/catalogo" className="btn-sec">
                Limpiar
              </Link>
            )}
          </div>
        </form>
        <MapaProcedencia conteos={conteos} seleccionado={filtros.estado} />
      </aside>

      <section>
        <h1 className="titulo mb-1">Catálogo</h1>
        <p className="mb-4 text-sm text-stone-600">
          {piezas.length} {piezas.length === 1 ? 'pieza encontrada' : 'piezas encontradas'}
          {filtros.estado && ` en ${filtros.estado}`}
        </p>
        {piezas.length === 0 ? (
          <p className="card text-stone-600">No hay piezas con esa combinación de filtros.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {piezas.map((p) => (
              <TarjetaPieza key={p.id} pieza={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
