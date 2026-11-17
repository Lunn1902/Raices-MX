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
      <div className="mx-auto max-w-lg py-14 text-center">
        <p className="plomo">Inicia sesión para consultar tus contratos de pedido por lote.</p>
        <Link href="/comprador-b2b/contratos" className="btn-sec mt-6">Volver a contratos</Link>
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
    <div className="mx-auto max-w-3xl py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/comprador-b2b/contratos"
          className="inline-flex items-center gap-2 text-sm font-medium text-secundaria transition-colors hover:text-terciaria"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a contratos
        </Link>
        <BotonImprimir />
      </div>

      <article className="mt-8 space-y-8 border-y border-secundaria/20 py-10 sm:py-14 print:mt-0 print:border-0 print:py-0">
        <header className="space-y-3 border-b border-secundaria/20 pb-6 text-center">
          <p className="eyebrow">Raíces MX · Documento de contrato</p>
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-secundaria sm:text-4xl">
            Contrato de compraventa por lote
          </h1>
          <p className="text-sm text-tinta-clara">Pedido {pedido.folio_pedido}</p>
          <div className="regla-accent" />
        </header>

        <section className="space-y-2 border-b border-secundaria/20 pb-6">
          <h2 className="font-display text-xl font-semibold text-secundaria sm:text-2xl">
            1. Identificación de las partes
          </h2>
          <p className="text-sm leading-relaxed text-tinta-clara">
            Se celebra el presente contrato entre <b className="text-secundaria">{pedido.nombre_productor}</b> (en lo sucesivo,
            &laquo;el productor&raquo;) y <b className="text-secundaria">{perfil.nombreCompleto}</b>, con correo{' '}
            {perfil.correo} (en lo sucesivo, &laquo;el comprador&raquo;), con la intermediación de la
            plataforma Raíces MX, que verifica el origen de las piezas y administra los pagos.
          </p>
        </section>

        <section className="space-y-2 border-b border-secundaria/20 pb-6">
          <h2 className="font-display text-xl font-semibold text-secundaria sm:text-2xl">
            2. Descripción de la pieza
          </h2>
          <p className="text-sm leading-relaxed text-tinta-clara">{descripcionPieza}</p>
        </section>

        <section className="space-y-3 border-b border-secundaria/20 pb-6">
          <h2 className="font-display text-xl font-semibold text-secundaria sm:text-2xl">
            3. Cantidad y precio
          </h2>
          <div className="text-sm">
            <Clausula etiqueta="Cantidad" valor={`${pedido.cantidad_total} piezas`} />
            <Clausula etiqueta="Precio unitario" valor={formatoMXN(precioUnitario)} />
            <Clausula etiqueta="Descuento por volumen" valor={`${descuento}%`} />
            <Clausula etiqueta="Subtotal" valor={formatoMXN(pedido.subtotal)} />
          </div>
        </section>

        <section className="space-y-3 border-b border-secundaria/20 pb-6">
          <h2 className="font-display text-xl font-semibold text-secundaria sm:text-2xl">
            4. Total y forma de pago
          </h2>
          <p className="text-sm leading-relaxed text-tinta-clara">
            El total del lote asciende a <b className="text-secundaria">{formatoMXN(pedido.total)}</b> y se cubre en dos exhibiciones:
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="border-l-2 border-terciaria py-2 pl-5">
              <p className="eyebrow-accent">Anticipo 30% al confirmar</p>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-terciaria tabular-nums">
                {formatoMXN(anticipo)}
              </p>
            </div>
            <div className="border-l-2 border-secundaria/30 py-2 pl-5">
              <p className="eyebrow">Saldo 70% a la entrega</p>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-secundaria tabular-nums">
                {formatoMXN(saldo)}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2 border-b border-secundaria/20 pb-6">
          <h2 className="font-display text-xl font-semibold text-secundaria sm:text-2xl">
            5. Plazo de entrega
          </h2>
          <p className="text-sm leading-relaxed text-tinta-clara">
            El productor entregará el lote en un plazo de <b className="text-secundaria">15 días naturales</b> contados a partir
            de la confirmación del anticipo, en la dirección registrada en el pedido.
          </p>
        </section>

        <section className="space-y-2 border-b border-secundaria/20 pb-6">
          <h2 className="font-display text-xl font-semibold text-secundaria sm:text-2xl">
            6. Condiciones de calidad
          </h2>
          <p className="text-sm leading-relaxed text-tinta-clara">
            Las piezas deberán corresponder a su ficha de origen y sello de originalidad, conservar la
            técnica artesanal declarada y llegar en buen estado. El comprador podrá objetar las piezas
            que no cumplan lo anterior dentro de los cinco días naturales posteriores a la entrega.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold text-secundaria sm:text-2xl">
            7. Fecha y aceptación
          </h2>
          <p className="text-sm leading-relaxed text-tinta-clara">
            Se firma el presente contrato en{' '}
            {new Date(pedido.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' } as const).replace(/^\w/, (c) => c.toUpperCase())},
            con fecha de emisión <b className="text-secundaria">{fecha}</b>. La confirmación del pedido implica la aceptación de
            estas cláusulas por ambas partes.
          </p>
        </section>

        <footer className="grid gap-8 border-t border-secundaria/20 pt-6 text-center text-sm sm:grid-cols-2">
          <div>
            <p className="border-t border-secundaria/40 pt-2 font-medium text-secundaria">El productor</p>
            <p className="mt-1 text-xs text-tinta-clara">{pedido.nombre_productor}</p>
          </div>
          <div>
            <p className="border-t border-secundaria/40 pt-2 font-medium text-secundaria">El comprador</p>
            <p className="mt-1 text-xs text-tinta-clara">{perfil.nombreCompleto}</p>
          </div>
        </footer>
      </article>
    </div>
  );
}

function Clausula({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-secundaria/20 py-2.5">
      <span className="text-tinta-clara">{etiqueta}</span>
      <b className="text-secundaria tabular-nums">{valor}</b>
    </div>
  );
}
