export const instant = false;

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';
import { formatoMXN } from '@/modules/comisiones/calculo';
import EstadoPedidoBadge from '../EstadoPedidoBadge';

export default async function PaginaPedidosB2B() {
  const perfil = await perfilSesion().catch(() => null);
  const pedidos = perfil
    ? (await repo().pedidosPorComprador(perfil.id)).filter((p) => p.tipo === 'B2B')
    : [];

  return (
    <div className="py-10">
      <header>
        <p className="eyebrow-accent">Pedidos por lote</p>
        <h1 className="titulo mt-3">Pedidos por lote</h1>
        <p className="plomo mt-4 max-w-2xl">
          Consulta el estado y la entrega de tus pedidos de mayoreo.
        </p>
        <div className="regla-accent mt-6" />
      </header>

      {!perfil ? (
        <div className="mx-auto max-w-lg py-14 text-center">
          <p className="plomo">Inicia sesión para ver tus pedidos por lote.</p>
          <Link href="/comprador-b2b/lotes" className="btn-sec mt-6">Cotizar un lote</Link>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="mx-auto max-w-lg py-14 text-center">
          <h2 className="subtitulo">Aún no hay pedidos por lote</h2>
          <p className="plomo mt-3">Cotiza un lote de 5 a 50 piezas para comenzar.</p>
          <Link href="/comprador-b2b/lotes" className="btn mt-6">Cotizar un lote</Link>
        </div>
      ) : (
        <ul>
          {pedidos.map((pedido) => (
            <li key={pedido.id} className="border-b border-secundaria/20 py-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Folio del pedido</p>
                  <Link
                    href={`/comprador-b2b/contratos/${pedido.id}`}
                    className="group mt-1 inline-flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-secundaria transition-colors hover:text-terciaria sm:text-3xl"
                  >
                    {pedido.folio_pedido}
                    <ArrowUpRight className="size-5 text-terciaria" aria-hidden="true" strokeWidth={1.5} />
                  </Link>
                  <p className="mt-1 text-sm text-tinta-clara">{pedido.nombre_productor}</p>
                </div>
                <EstadoPedidoBadge estado={pedido.estado} />
              </div>

              <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="eyebrow">Piezas</p>
                  <p className="mt-1 text-sm text-secundaria tabular-nums">
                    {pedido.cantidad_total} {pedido.cantidad_total === 1 ? 'pieza' : 'piezas'}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Total</p>
                  <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-terciaria tabular-nums">
                    {formatoMXN(pedido.total)}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Fecha</p>
                  <p className="mt-1 text-sm text-secundaria">
                    {new Date(pedido.created_at).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Contrato</p>
                  <Link href={`/comprador-b2b/contratos/${pedido.id}`} className="enlace">
                    Consultar
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
