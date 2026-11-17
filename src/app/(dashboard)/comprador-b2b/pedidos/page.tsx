export const instant = false;

import Link from 'next/link';
import { Package } from 'lucide-react';
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
    <div className="space-y-6">
      <div>
        <h1 className="titulo">Pedidos mayoristas</h1>
        <p className="mt-2 text-stone-600">Consulta el estado y la entrega de tus lotes B2B.</p>
      </div>

      {!perfil ? (
        <div className="card mx-auto max-w-lg text-center">
          <p className="mb-4 text-stone-600">Inicia sesión como comprador B2B para ver tus pedidos.</p>
          <Link href="/comprador-b2b/lotes" className="btn-sec">Cotizar un lote</Link>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="card mx-auto max-w-lg text-center">
          <Package className="mx-auto mb-3 size-10 text-stone-400" />
          <h2 className="mb-1 font-semibold text-secundaria">Aún no hay pedidos mayoristas</h2>
          <p className="mb-4 text-sm text-stone-600">Cotiza un lote de 5 a 50 piezas para comenzar.</p>
          <Link href="/comprador-b2b/lotes" className="btn">Cotizar un lote</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-fondo/50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Folio</th>
                <th scope="col" className="px-4 py-3 font-medium">Productor</th>
                <th scope="col" className="px-4 py-3 font-medium">Cantidad</th>
                <th scope="col" className="px-4 py-3 font-medium">Total</th>
                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="transition hover:bg-fondo/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/comprador-b2b/contratos/${pedido.id}`}
                      className="font-mono font-medium text-secundaria hover:underline"
                    >
                      {pedido.folio_pedido}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{pedido.nombre_productor}</td>
                  <td className="px-4 py-3 tabular-nums">{pedido.cantidad_total}</td>
                  <td className="px-4 py-3 font-medium tabular-nums text-secundaria">
                    {formatoMXN(pedido.total)}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoPedidoBadge estado={pedido.estado} />
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {new Date(pedido.created_at).toLocaleDateString('es-MX')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

