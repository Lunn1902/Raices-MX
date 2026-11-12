import Link from 'next/link';
import { MapPin, ShieldCheck } from 'lucide-react';
import { formatoMXN } from '@/modules/comisiones/calculo';
import type { PiezaCatalogo } from '@/types';
import { BotonAgregar } from './BotonAgregar';

export function TarjetaPieza({ pieza }: { pieza: PiezaCatalogo }) {
  return (
    <article className="card flex flex-col gap-3 p-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- en modo demo las fotos son data URLs */}
      <img src={pieza.fotografias_urls[0]} alt={pieza.nombre} className="aspect-[4/3] w-full rounded-t-xl object-cover" loading="lazy" />
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-milpa">{pieza.categoria}</p>
        <h3 className="font-semibold leading-tight">{pieza.nombre}</h3>
        <p className="flex items-center gap-1 text-sm text-stone-600">
          <MapPin className="size-4 shrink-0" /> {pieza.comunidad}, {pieza.estado} · {pieza.pueblo_originario}
        </p>
        <p className="text-sm text-stone-600">
          {pieza.tecnica} · por {pieza.nombre_productor}
        </p>
        <div className="mt-auto flex items-end justify-between pt-1">
          <p className="text-lg font-bold">{formatoMXN(pieza.precio_unitario)}</p>
          {pieza.folio_unico && (
            <Link href={`/verificar/${pieza.folio_unico}`} className="flex items-center gap-1 text-xs text-milpa hover:underline">
              <ShieldCheck className="size-4" /> Ver sello
            </Link>
          )}
        </div>
        <BotonAgregar productoId={pieza.id} stock={pieza.stock} />
      </div>
    </article>
  );
}
