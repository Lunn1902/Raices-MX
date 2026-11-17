'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Minus, Plus, Trash2 } from 'lucide-react';
import { useCarrito } from '@/components/carrito';
import { enviarJson } from '@/components/Campo';
import { formatoMXN } from '@/modules/comisiones/calculo';
import type { Cotizacion } from '@/modules/pedidos-b2c/servicio';
import type { PedidoCreado, PiezaCatalogo } from '@/types';

// CU-08: el desglose 90/10 que se muestra viene del servidor, calculado con precios de la base
export default function Carrito() {
  const { items, cambiar, vaciar } = useCarrito();
  const [piezas, setPiezas] = useState<PiezaCatalogo[]>([]);
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [pagando, setPagando] = useState(false);
  const [pedidos, setPedidos] = useState<PedidoCreado[] | null>(null);
  const clave = JSON.stringify(items);

  useEffect(() => {
    fetch('/api/v1/productos').then((r) => r.json()).then(setPiezas);
  }, []);

  useEffect(() => {
    const actuales = JSON.parse(clave);
    if (actuales.length === 0) return;
    enviarJson<Cotizacion>('/api/v1/pedidos/cotizacion', 'POST', { items: actuales }).then((r) => {
      setCotizacion(r.ok ? r.data : null);
      setError(r.ok ? '' : r.error);
    });
  }, [clave]);

  async function pagar() {
    setPagando(true);
    const r = await enviarJson<{ pedidos: PedidoCreado[] }>('/api/v1/pedidos', 'POST', { items, direccion_entrega: direccion });
    setPagando(false);
    if (!r.ok) return setError(r.campos.direccion_entrega?.[0] ?? r.error);
    setPedidos(r.data.pedidos);
    vaciar();
  }

  if (pedidos) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-secundaria" strokeWidth={1.25} />
        <h1 className="subtitulo mt-5">Compra confirmada</h1>
        <div className="regla mt-6" />
        <div className="mt-2 text-left">
          {pedidos.map((p) => (
            <Fila key={p.pedido_id} etiqueta={p.folio_pedido} valor={p.total} />
          ))}
        </div>
        <p className="plomo mt-6">
          El productor recibe {formatoMXN(pedidos.reduce((a, p) => a + p.monto_productor, 0))} de tu compra individual.
        </p>
        <Link href="/catalogo" className="btn mt-8">Seguir comprando</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <p className="plomo">Tu carrito está vacío.</p>
        <Link href="/catalogo" className="btn mt-6">Ir al catálogo</Link>
      </div>
    );
  }

  const t = cotizacion?.totales;
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <section>
        <p className="eyebrow">Tu selección</p>
        <h1 className="titulo mt-3">Carrito</h1>
        <div className="regla-accent mt-6" />

        <ul>
          {items.map((i) => {
            const p = piezas.find((x) => x.id === i.producto_id);
            return (
              <li key={i.producto_id} className="flex items-center gap-4 border-b border-secundaria/20 py-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- en modo demo las fotos son data URLs */}
                {p && <img src={p.fotografias_urls[0]} alt="" className="size-16 shrink-0 object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-secundaria">{p?.nombre ?? 'Pieza'}</p>
                  <p className="mt-1 text-sm text-tinta-clara">
                    {p && `${formatoMXN(p.precio_unitario)} · ${p.nombre_productor}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    aria-label="Quitar uno"
                    className="border border-secundaria/30 px-2 py-1 text-secundaria transition-colors hover:border-terciaria hover:text-terciaria"
                    onClick={() => cambiar(i.producto_id, i.cantidad - 1)}
                  >
                    {i.cantidad === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
                  </button>
                  <span className="w-6 text-center font-mono text-sm tabular-nums">{i.cantidad}</span>
                  <button
                    aria-label="Agregar uno"
                    className="border border-secundaria/30 px-2 py-1 text-secundaria transition-colors hover:border-terciaria hover:text-terciaria disabled:opacity-40"
                    disabled={!!p && i.cantidad >= p.stock}
                    onClick={() => cambiar(i.producto_id, i.cantidad + 1)}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="h-fit">
        <p className="eyebrow">Transparencia 90 / 10</p>
        <h2 className="subtitulo mt-3">Desglose</h2>
        <div className="regla-accent mt-4" />

        {cotizacion?.pedidos.map((p) => (
          <div key={p.productor_id} className="border-b border-secundaria/20 py-5">
            <p className="eyebrow-accent">{p.nombre_productor}</p>
            <div className="mt-2">
              <Fila etiqueta="Subtotal piezas" valor={p.subtotal} />
              <Fila etiqueta="Para el productor (90%)" valor={p.montoProductor} destacado />
              <Fila etiqueta="Comisión RaicesMX (10%)" valor={p.comisionPlataforma} />
              <Fila etiqueta="Envío" valor={p.costoEnvio} />
            </div>
          </div>
        ))}

        {t && (
          <div className="border-b border-secundaria/20 py-5">
            <Fila etiqueta="Total para productores" valor={t.montoProductor} destacado />
            <Fila etiqueta="Total comisión RaicesMX" valor={t.comisionPlataforma} />
            <Fila etiqueta="Total envío" valor={t.costoEnvio} />
          </div>
        )}

        {t && (
          <div className="py-6">
            <p className="eyebrow-accent">Total a pagar</p>
            <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-terciaria tabular-nums sm:text-5xl">
              {formatoMXN(t.total)}
            </p>
            <p className="mt-2 text-xs text-tinta-clara">
              Desglose 90/10 calculado sobre los precios registrados de cada pieza.
            </p>
          </div>
        )}

        <label className="block border-t border-secundaria/20 pt-5">
          <span className="label">Dirección de entrega</span>
          <textarea rows={2} value={direccion} onChange={(e) => setDireccion(e.target.value)} className="input" placeholder="Calle, número, colonia, CP, ciudad" />
        </label>

        {error && <p className="mt-4 text-sm text-terciaria" role="alert">{error}</p>}

        <button className="btn-accent mt-6 w-full" disabled={!t || pagando} onClick={pagar}>
          {pagando ? 'Procesando…' : 'Finalizar compra'}
        </button>
        <p className="mt-4 text-xs text-tinta-clara">Pago simulado con tarjeta de prueba. No se realiza ningún cargo.</p>
      </aside>
    </div>
  );
}

function Fila({ etiqueta, valor, destacado }: { etiqueta: string; valor: number; destacado?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-secundaria/20 py-2.5 text-sm">
      <span className={destacado ? 'font-medium text-secundaria' : 'text-tinta-clara'}>{etiqueta}</span>
      <span className={`tabular-nums ${destacado ? 'font-semibold text-secundaria' : 'text-secundaria'}`}>
        {formatoMXN(valor)}
      </span>
    </div>
  );
}
