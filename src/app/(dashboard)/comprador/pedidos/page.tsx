import { Suspense } from 'react';
import Link from 'next/link';
import AvisoAcceso from '@/components/AvisoAcceso';
import Badge from '@/components/Badge';
import Cargando from '@/components/Cargando';
import { formatoMXN } from '@/modules/comisiones/calculo';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';
import type { EstadoPedido } from '@/types';

const ETIQUETAS_ESTADO: Record<EstadoPedido, string> = {
  confirmado: 'Confirmado',
  en_proceso: 'En proceso',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

function estatusPedido(estado: EstadoPedido) {
  return {
    texto: ETIQUETAS_ESTADO[estado],
    tono: estado === 'cancelado' ? ('terciaria' as const) : ('secundaria' as const),
  };
}

export default function PedidosComprador() {
  return (
    <Suspense fallback={<Cargando etiqueta="Cargando pedidos…" />}>
      <ContenidoPedidos />
    </Suspense>
  );
}

async function ContenidoPedidos() {
  const perfil = await perfilSesion();
  if (!perfil) {
    return (
      <AvisoAcceso
        titulo="Inicia sesión"
        mensaje="Inicia sesión para consultar tus pedidos."
        href="/login"
        etiqueta="Iniciar sesión"
      />
    );
  }

  const pedidos = await repo().pedidosPorComprador(perfil.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="titulo">Mis pedidos</h1>
        <p className="mt-1 text-stone-600">Consulta el estado y el detalle de tus compras.</p>
      </header>

      {pedidos.length === 0 ? (
        <div className="card mx-auto max-w-lg space-y-3 text-center">
          <p className="text-stone-600">Todavía no tienes pedidos.</p>
          <Link href="/catalogo" className="btn">Explorar el catálogo</Link>
        </div>
      ) : (
        <section className="card overflow-x-auto" aria-label="Listado de mis pedidos">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-600">
                <th scope="col" className="p-4 font-medium">Folio</th>
                <th scope="col" className="p-4 font-medium">Productor</th>
                <th scope="col" className="p-4 font-medium">Cantidad</th>
                <th scope="col" className="p-4 font-medium">Total</th>
                <th scope="col" className="p-4 font-medium">Estado</th>
                <th scope="col" className="p-4 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => {
                const e = estatusPedido(p.estado);
                return (
                  <tr key={p.id} className="border-b border-stone-200 last:border-0">
                    <td className="p-4 font-mono text-xs">{p.folio_pedido}</td>
                    <td className="p-4 font-medium">{p.nombre_productor}</td>
                    <td className="p-4">{p.cantidad_total}</td>
                    <td className="p-4 font-medium text-secundaria">{formatoMXN(p.total)}</td>
                    <td className="p-4"><Badge texto={e.texto} tono={e.tono} /></td>
                    <td className="p-4 text-stone-600">
                      {new Date(p.created_at).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      <Link href="/comprador/calificar" className="btn-sec">Calificar mis pedidos</Link>
    </div>
  );
}
