export const instant = false;

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';
import { cotizarLoteB2B, formatoMXN, type CotizacionLote } from '@/modules/comisiones/calculo';
import BotonImprimir from './BotonImprimir';

// Nota: en Next.js 16 `params` es una Promise y debe esperarse antes de usarse.
export default async function PaginaContratoB2B({
  params,
}: {
  params: Promise<{ pedidoId: string }>;
}) {
  const { pedidoId } = await params;
  const perfil = await perfilSesion().catch(() => null);

  if (!perfil) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <p className="mb-4 text-stone-600">Inicia sesión como comprador B2B para consultar tus contratos.</p>
        <Link href="/comprador-b2b/contratos" className="btn-sec">Volver a contratos</Link>
      </div>
    );
  }

  const pedido = (await repo().pedidosPorComprador(perfil.id)).find(
    (p) => p.id === pedidoId && p.tipo === 'B2B',
  );
  if (!pedido) notFound();

  // El resumen del pedido no expone el precio unitario: se reconstruye a partir del subtotal.
  const precioUnitario = pedido.cantidad_total > 0
    ? Math.round((pedido.subtotal / pedido.cantidad_total) * 100) / 100
    : 0;

  let cotizacion: CotizacionLote | null = null;
  try {
    if (precioUnitario > 0) cotizacion = cotizarLoteB2B(pedido.cantidad_total, precioUnitario);
  } catch {
    cotizacion = null;
  }

  const anticipo = cotizacion?.anticipo30 ?? Math.round(pedido.total * 100 * 0.3) / 100;
  const saldo = cotizacion?.saldo70 ?? (Math.round(pedido.total * 100) / 100 - anticipo);
  const descuento = cotizacion?.porcentajeDescuento ?? 0;

  const piezas = await repo().catalogo({});
  const pieza = piezas.find((p) => p.productor_id === pedido.productor_id) ?? null;
  const descripcionPieza = pieza
    ? `${pieza.nombre}. ${pieza.descripcion ?? `${pieza.tecnica}, ${pieza.materiales}`}. ${pieza.comunidad}, ${pieza.estado}.`
    : `Piezas artesanales elaboradas por ${pedido.nombre_productor}, según el detalle del pedido.`;

  const fecha = new Date(pedido.created_at).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/comprador-b2b/contratos"
          className="inline-flex items-center gap-1 text-sm text-secundaria hover:underline print:hidden"
        >
          <ArrowLeft className="size-4" />
          Volver a contratos
        </Link>
        <BotonImprimir />
      </div>

      <article className="card space-y-6 p-6 sm:p-10 print:border-0 print:shadow-none">
        <header className="space-y-2 border-b border-stone-200 pb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Raíces MX</p>
          <h1 className="font-display text-2xl font-semibold text-secundaria sm:text-3xl">
            Contrato de compraventa por lote B2B
          </h1>
          <p className="font-mono text-sm text-stone-600">
            Pedido {pedido.folio_pedido}
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="font-semibold text-secundaria">1. Identificación de las partes</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            Se celebra el presente contrato entre <b>{pedido.nombre_productor}</b> (en lo sucesivo,
            &laquo;el productor&raquo;) y <b>{perfil.nombreCompleto}</b>, con correo{' '}
            {perfil.correo} (en lo sucesivo, &laquo;el comprador&raquo;), con la intermediación de la
            plataforma Raíces MX, que verifica el origen de las piezas y administra los pagos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-secundaria">2. Descripción de la pieza</h2>
          <p className="text-sm leading-relaxed text-stone-700">{descripcionPieza}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-secundaria">3. Cantidad y precio</h2>
          <div className="grid gap-2 rounded-lg bg-fondo p-4 text-sm sm:grid-cols-2">
            <p><span className="text-stone-600">Cantidad: </span><b>{pedido.cantidad_total} piezas</b></p>
            <p><span className="text-stone-600">Precio unitario: </span><b>{formatoMXN(precioUnitario)}</b></p>
            <p><span className="text-stone-600">Descuento por volumen: </span><b>{descuento}%</b></p>
            <p><span className="text-stone-600">Subtotal: </span><b>{formatoMXN(pedido.subtotal)}</b></p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-secundaria">4. Total y forma de pago</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            El total del lote asciende a <b>{formatoMXN(pedido.total)}</b> y se cubre en dos exhibiciones:
          </p>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-terciaria/5 p-3">
              <p className="text-xs font-medium text-terciaria">Anticipo 30% al confirmar</p>
              <p className="text-lg font-bold text-terciaria">{formatoMXN(anticipo)}</p>
            </div>
            <div className="rounded-lg bg-fondo p-3">
              <p className="text-xs text-stone-600">Saldo 70% a la entrega</p>
              <p className="text-lg font-bold text-secundaria">{formatoMXN(saldo)}</p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-secundaria">5. Plazo de entrega</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            El productor entregará el lote en un plazo de <b>15 días naturales</b> contados a partir
            de la confirmación del anticipo, en la dirección registrada en el pedido.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-secundaria">6. Condiciones de calidad</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            Las piezas deberán corresponder a su ficha de origen y sello de originalidad, conservar la
            técnica artesanal declarada y llegar en buen estado. El comprador podrá objetar las piezas
            que no cumplan lo anterior dentro de los cinco días naturales posteriores a la entrega.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-secundaria">7. Fecha y aceptación</h2>
          <p className="text-sm leading-relaxed text-stone-700">
            Se firma el presente contrato en{' '}
            {new Date(pedido.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' } as const).replace(/^\w/, (c) => c.toUpperCase())},
            con fecha de emisión <b>{fecha}</b>. La confirmación del pedido implica la aceptación de
            estas cláusulas por ambas partes.
          </p>
        </section>

        <footer className="grid gap-8 border-t border-stone-200 pt-6 text-center text-sm sm:grid-cols-2">
          <div>
            <p className="border-t border-stone-400 pt-2">El productor</p>
            <p className="text-xs text-stone-500">{pedido.nombre_productor}</p>
          </div>
          <div>
            <p className="border-t border-stone-400 pt-2">El comprador</p>
            <p className="text-xs text-stone-500">{perfil.nombreCompleto}</p>
          </div>
        </footer>
      </article>
    </div>
  );
}

