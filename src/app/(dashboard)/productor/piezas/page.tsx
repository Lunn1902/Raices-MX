export const instant = false;

import Link from 'next/link';
import { ArrowUpRight, QrCode } from 'lucide-react';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';
import { formatoMXN } from '@/modules/comisiones/calculo';

export const metadata = { title: 'Mis piezas' };

function Aviso({ titulo, mensaje }: { titulo: string; mensaje: string }) {
  return (
    <div className="regla py-10">
      <p className="eyebrow-accent">Mis piezas</p>
      <h1 className="titulo mt-3">{titulo}</h1>
      <p className="plomo mt-4 max-w-xl">{mensaje}</p>
    </div>
  );
}

export default async function MisPiezas() {
  const perfil = await perfilSesion();

  if (!perfil) {
    return <Aviso titulo="Mis piezas" mensaje="Inicia sesión para ver tus piezas publicadas." />;
  }

  if (perfil.rol !== 'productor') {
    return (
      <Aviso
        titulo="Mis piezas"
        mensaje="Esta sección es exclusiva para productores. Tu cuenta no tiene acceso a este espacio."
      />
    );
  }

  let piezas;
  try {
    const catalogo = await repo().catalogo({});
    piezas = catalogo.filter((p) => p.productor_id === perfil.id);
  } catch {
    return (
      <Aviso
        titulo="Mis piezas"
        mensaje="No pudimos cargar tus piezas. Intenta recargar la página más tarde."
      />
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow-accent">Tu catálogo</p>
        <h1 className="titulo mt-4">Mis piezas</h1>
        <p className="plomo mt-4 max-w-2xl">
          Piezas publicadas y aprobadas en el catálogo. {piezas.length} {piezas.length === 1 ? 'pieza' : 'piezas'} en total.
        </p>
      </header>

      {piezas.length === 0 ? (
        <div className="regla py-10">
          <p className="plomo">Todavía no tienes piezas publicadas en el catálogo.</p>
          <Link href="/productor/publicar" className="btn-accent mt-6">
            Publicar mi primera pieza
          </Link>
        </div>
      ) : (
        <section aria-label="Listado de piezas" className="space-y-0">
          {piezas.map((pieza) => (
            <article
              key={pieza.id}
              className="regla grid gap-5 py-8 sm:grid-cols-[96px_1fr_auto] sm:items-center sm:gap-8"
            >
              <Link
                href={`/verificar/${pieza.folio_unico ?? ''}`}
                className="block size-24 overflow-hidden bg-secundaria/10"
                aria-label={`Ver ficha de ${pieza.nombre}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- en modo demo las fotos son data URLs */}
                <img src={pieza.fotografias_urls[0]} alt={pieza.nombre} className="size-full object-cover" loading="lazy" />
              </Link>

              <div className="min-w-0">
                <p className="eyebrow-accent">{pieza.categoria}</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-secundaria sm:text-3xl">
                  {pieza.nombre}
                </h2>
                <p className="eyebrow mt-3">Existencias · {pieza.stock}</p>

                {pieza.folio_unico ? (
                  <Link href={`/verificar/${pieza.folio_unico}`} className="enlace mt-4 text-sm">
                    <QrCode className="size-4 text-terciaria" aria-hidden="true" />
                    {pieza.folio_unico}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <p className="mt-4 text-sm text-terciaria">Sin sello QR</p>
                )}
              </div>

              <div className="sm:text-right">
                <p className="font-display text-3xl font-semibold text-secundaria sm:text-4xl">
                  {formatoMXN(pieza.precio_unitario)}
                </p>
                <p className="eyebrow mt-2">Precio por pieza</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
