import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    <div className="py-10">
      <header>
        <p className="eyebrow-accent">Tu actividad</p>
        <h1 className="titulo mt-3">Mis pedidos</h1>
        <p className="plomo mt-4 max-w-2xl">Consulta el estado y el detalle de tus compras.</p>
        <div className="regla-accent mt-6" />
      </header>

      {pedidos.length === 0 ? (
        <div className="mx-auto max-w-lg py-14 text-center">
          <p className="plomo">Todavía no tienes pedidos.</p>
          <Link href="/catalogo" className="btn mt-6">Explorar el catálogo</Link>
        </div>
      ) : (
        <ul aria-label="Listado de mis pedidos">
          {pedidos.map((p) => {
            const e = estatusPedido(p.estado);
            return (
              <li key={p.id} className="border-b border-secundaria/20 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Folio del pedido</p>
                    <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-secundaria sm:text-3xl">
                      {p.folio_pedido}
                    </p>
                  </div>
                  <Badge texto={e.texto} tono={e.tono} />
                </div>

                <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="eyebrow">Productor</p>
                    <p className="mt-1 text-sm text-secundaria">{p.nombre_productor}</p>
                  </div>
                  <div>
                    <p className="eyebrow">Cantidad</p>
                    <p className="mt-1 text-sm text-secundaria tabular-nums">
                      {p.cantidad_total} {p.cantidad_total === 1 ? 'pieza' : 'piezas'}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Fecha</p>
                    <p className="mt-1 text-sm text-secundaria">
                      {new Date(p.created_at).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Total</p>
                    <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-terciaria tabular-nums">
                      {formatoMXN(p.total)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Link href="/comprador/calificar" className="enlace mt-8">
        Calificar mis pedidos
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
