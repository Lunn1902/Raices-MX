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
      <div className="mx-auto max-w-lg">
        <div className="card border-red-300 bg-red-50 text-center">
          <ShieldAlert className="mx-auto mb-2 size-14 text-red-700" />
          <h1 className="text-2xl font-bold text-red-800">{r.etiqueta}</h1>
          <p className="mt-2 font-mono text-sm">{r.folio}</p>
          <p className="mt-3 text-red-900">{r.motivo}</p>
          <p className="mt-4 text-sm text-stone-600">
            No compres esta pieza como auténtica de RaicesMX. Si la encontraste a la venta, repórtala a tu promotor.
          </p>
        </div>
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
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="card flex items-center gap-4 border-green-300 bg-green-50">
        <ShieldCheck className="size-14 shrink-0 text-milpa" />
        <div>
          <h1 className="text-2xl font-bold text-milpa">{r.etiqueta}</h1>
          <p className="font-mono text-sm">{r.folio}</p>
          <p className="text-xs text-stone-600">
            Emitido el {new Date(r.fecha_emision!).toLocaleDateString('es-MX', { dateStyle: 'long' })} · firma HMAC-SHA256 válida
          </p>
        </div>
      </div>

      <article className="card grid gap-4 sm:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- en modo demo las fotos son data URLs */}
        <img src={ficha.fotografias_urls[0]} alt={producto.nombre} className="aspect-square w-full rounded-lg object-cover" />
        <div>
          <p className="text-xs font-medium uppercase text-barro">{producto.categoria}</p>
          <h2 className="mb-3 text-xl font-semibold">{producto.nombre}</h2>
          <dl className="space-y-1.5 text-sm">
            {datos.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-stone-100 pb-1">
                <dt className="text-stone-600">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </article>

      {ficha.historia_pieza && (
        <section className="card">
          <h3 className="mb-1 font-semibold">Historia de la pieza</h3>
          <p className="text-stone-700">{ficha.historia_pieza}</p>
        </section>
      )}

      <section className="card">
        <h3 className="mb-1 font-semibold">Taller {productor.nombre_taller}</h3>
        <p className="text-sm text-stone-700">
          {productor.nombre_completo} · {productor.comunidad}, {productor.estado} · Pueblo {productor.pueblo_originario}
        </p>
        <Link href={`/catalogo?estado=${encodeURIComponent(productor.estado)}`} className="mt-2 inline-block text-sm text-barro hover:underline">
          Ver más piezas de {productor.estado} →
        </Link>
      </section>
    </div>
  );
}
