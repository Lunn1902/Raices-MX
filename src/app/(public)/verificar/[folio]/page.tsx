import Link from 'next/link';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { formatoMXN } from '@/modules/comisiones/calculo';
import { verificarFolio } from '@/modules/sello-qr/servicio';

// siempre se consulta la base al momento: existencias y firmas cambian
export const instant = false;

export const metadata = { title: 'Verificar origen', robots: { index: false } };

// CU-06: página pública, no requiere sesión. La verificación HMAC ocurre en el servidor.
export default async function Verificar({ params, searchParams }: PageProps<'/verificar/[folio]'>) {
  const { folio } = await params;
  const { sig } = await searchParams;
  const r = await verificarFolio(decodeURIComponent(folio), typeof sig === 'string' ? sig : null);

  if (!r.verificado || !r.ficha || !r.producto || !r.productor) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow-accent">Verificación de sello</p>
        <h1 className="titulo mt-3">{r.etiqueta}</h1>
        <div className="regla-accent mt-6" />

        <section className="regla mt-8 py-10 text-center">
          <ShieldAlert className="mx-auto size-16 text-terciaria" strokeWidth={1.25} />
          <p className="mt-6 font-mono text-sm tracking-wider text-terciaria">{r.folio}</p>
          <p className="plomo mx-auto mt-4 max-w-xl">{r.motivo}</p>

          <div className="mt-8 bg-terciaria/10 px-6 py-6 text-left">
            <p className="eyebrow-accent">No lo adquieras como auténtico</p>
            <p className="mt-2 text-sm leading-relaxed text-secundaria">
              No compres esta pieza como auténtica de RaicesMX. Si la encontraste a la venta, repórtala a tu promotor.
            </p>
          </div>
        </section>
        <div className="regla" />
      </div>
    );
  }

  const { ficha, producto, productor } = r;
  const datos: [string, string][] = [
    ['Productor', ficha.nombre_productor],
    ['Comunidad', ficha.comunidad],
    ['Estado', ficha.estado],
    ['Pueblo originario', ficha.pueblo_originario],
    ['Técnica', ficha.tecnica],
    ['Materiales', ficha.materiales],
    ['Tiempo de elaboración', ficha.tiempo_elaboracion],
    ['Precio registrado', formatoMXN(ficha.precio_registrado)],
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <header className="regla-accent pt-6">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="min-w-0">
            <p className="eyebrow">RaicesMX · Documento de verificación</p>
            <h1 className="titulo mt-3">{r.etiqueta}</h1>
            <p className="plomo mt-3 max-w-xl">
              Este documento certifica que la pieza fue registrada y verificada en su origen.
            </p>
          </div>

          {/* Sello editorial: verde bosque con acento coral */}
          <div className="flex size-28 shrink-0 flex-col items-center justify-center border-2 border-terciaria text-secundaria ring-1 ring-secundaria/30 ring-offset-4 ring-offset-fondo sm:size-32">
            <ShieldCheck className="size-10" strokeWidth={1.25} />
            <span className="mt-2 text-center text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] text-terciaria">
              Sello válido
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <p className="eyebrow-accent">Folio</p>
          <p className="font-mono text-lg font-semibold tracking-wider text-terciaria sm:text-xl">{r.folio}</p>
        </div>
        <p className="mt-1 text-xs text-tinta-clara">
          Emitido el {new Date(r.fecha_emision!).toLocaleDateString('es-MX', { dateStyle: 'long' })} · firma HMAC-SHA256 válida
        </p>
      </header>

      <article className="regla mt-8 grid gap-8 py-8 sm:grid-cols-[220px_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element -- en modo demo las fotos son data URLs */}
        <img src={ficha.fotografias_urls[0]} alt={producto.nombre} className="aspect-square w-full border border-secundaria/20 object-cover" />
        <div>
          <p className="eyebrow">{producto.categoria}</p>
          <h2 className="subtitulo mt-1">{producto.nombre}</h2>

          <dl className="mt-6">
            {datos.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-secundaria/20 py-3">
                <dt className="text-sm text-tinta-clara">{k}</dt>
                <dd className="text-right text-sm font-medium text-secundaria">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </article>

      {ficha.historia_pieza && (
        <section className="regla py-8">
          <h3 className="subtitulo">Historia de la pieza</h3>
          <p className="plomo mt-3 max-w-3xl">{ficha.historia_pieza}</p>
        </section>
      )}

      <section className="regla py-8">
        <h3 className="subtitulo">Taller {productor.nombre_taller}</h3>
        <p className="plomo mt-3">
          {productor.nombre_completo} · {productor.comunidad}, {productor.estado} · Pueblo {productor.pueblo_originario}
        </p>
        <Link href={`/catalogo?estado=${encodeURIComponent(productor.estado)}`} className="enlace mt-4">
          Ver más piezas de {productor.estado} →
        </Link>
      </section>
      <div className="regla" />
    </div>
  );
}
