export const instant = false;

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';
import { formatoMXN } from '@/modules/comisiones/calculo';
import EstadoPedidoBadge from '../EstadoPedidoBadge';

export default async function PaginaContratosB2B() {
  // En modo demo no hay variables de Supabase: la sesión simplemente no existe.
  const perfil = await perfilSesion().catch(() => null);
  const pedidos = perfil
    ? (await repo().pedidosPorComprador(perfil.id)).filter((p) => p.tipo === 'B2B')
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="titulo">Contratos B2B</h1>
        <p className="mt-2 text-stone-600">
          Cada lote confirmado genera un contrato con anticipo 30% y saldo 70% a la entrega.
        </p>
      </div>

      {!perfil ? (
        <div className="card mx-auto max-w-lg text-center">
          <p className="mb-4 text-stone-600">Inicia sesión como comprador B2B para ver tus contratos.</p>
          <Link href="/comprador-b2b/lotes" className="btn-sec">Cotizar un lote</Link>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="card mx-auto max-w-lg text-center">
          <FileText className="mx-auto mb-3 size-10 text-stone-400" />
          <p className="mb-4 text-stone-600">Aún no tienes contratos. Comienza cotizando un lote.</p>
          <Link href="/comprador-b2b/lotes" className="btn">Cotizar un lote</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pedidos.map((pedido) => (
            <article key={pedido.id} className="card flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-fondo p-2 text-secundaria">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-semibold text-secundaria">{pedido.folio_pedido}</p>
                  <p className="truncate text-sm text-stone-600">{pedido.nombre_productor}</p>
                </div>
                <EstadoPedidoBadge estado={pedido.estado} />
              </div>

              <dl className="grid grid-cols-2 gap-2 rounded-lg bg-fondo p-3 text-sm">
                <div>
                  <dt className="text-xs text-stone-500">Piezas</dt>
                  <dd className="font-medium">{pedido.cantidad_total}</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-500">Total</dt>
                  <dd className="font-medium text-secundaria">{formatoMXN(pedido.total)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-500">Fecha</dt>
                  <dd className="font-medium">
                    {new Date(pedido.created_at).toLocaleDateString('es-MX')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-500">Anticipo 30</dt>
                  <dd className="font-medium text-terciaria">
                    {formatoMXN(Math.round(pedido.total * 100 * 0.3) / 100)}
                  </dd>
                </div>
              </dl>

              <Link
                href={`/comprador-b2b/contratos/${pedido.id}`}
                className="btn-sec mt-auto self-start"
              >
                Ver contrato
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

