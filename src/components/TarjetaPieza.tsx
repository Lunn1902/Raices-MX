import Link from 'next/link';
import { ArrowUpRight, MapPin, ShieldCheck } from 'lucide-react';
import { formatoMXN } from '@/modules/comisiones/calculo';
import type { PiezaCatalogo } from '@/types';
import { BotonAgregar } from './BotonAgregar';

export function TarjetaPieza({ pieza }: { pieza: PiezaCatalogo }) {
  return (
    <article className="regla group grid gap-5 py-7 sm:grid-cols-[180px_1fr] sm:gap-8">
      <Link href={`/verificar/${pieza.folio_unico ?? ''}`} className="relative block aspect-[4/3] overflow-hidden bg-secundaria/10" aria-label={`Ver ficha de ${pieza.nombre}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- en modo demo las fotos son data URLs */}
        <img src={pieza.fotografias_urls[0]} alt={pieza.nombre} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        {pieza.folio_unico && (
          <span className="absolute bottom-0 left-0 flex items-center gap-1 bg-terciaria px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
            <ShieldCheck className="size-3" /> Origen verificado
          </span>
        )}
      </Link>

      <div className="flex flex-col">
        <p className="eyebrow-accent">{pieza.categoria}</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-secundaria sm:text-3xl">
          <Link href={`/verificar/${pieza.folio_unico ?? ''}`} className="transition-colors hover:text-terciaria">{pieza.nombre}</Link>
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-tinta-clara">
          <MapPin className="size-4 shrink-0 text-terciaria" />
          {pieza.comunidad}, {pieza.estado} · Pueblo {pieza.pueblo_originario}
        </p>
        <p className="mt-1 text-sm text-tinta-clara">{pieza.tecnica} · por {pieza.nombre_productor}</p>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
          <div>
            <p className="font-display text-3xl font-semibold text-secundaria">{formatoMXN(pieza.precio_unitario)}</p>
            <p className="mt-1 text-xs text-tinta-clara">El artesano recibe el 90%</p>
          </div>
          <div className="flex items-center gap-4">
            {pieza.folio_unico && (
              <Link href={`/verificar/${pieza.folio_unico}`} className="inline-flex items-center gap-1 text-sm font-semibold text-secundaria transition-colors hover:text-terciaria">
                Ver sello <ArrowUpRight className="size-4" />
              </Link>
            )}
            <BotonAgregar productoId={pieza.id} stock={pieza.stock} />
          </div>
        </div>
      </div>
    </article>
  );
}
