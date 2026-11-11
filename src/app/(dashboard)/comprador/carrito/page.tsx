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
      <div className="card mx-auto max-w-lg space-y-3 text-center">
        <CheckCircle2 className="mx-auto size-12 text-milpa" />
        <h1 className="text-xl font-bold">Pago de prueba aprobado</h1>
        {pedidos.map((p) => (
          <p key={p.pedido_id} className="text-sm">
            <span className="font-mono">{p.folio_pedido}</span> · {formatoMXN(p.total)} · al productor {formatoMXN(p.monto_productor)}
          </p>
        ))}
        <Link href="/catalogo" className="btn">Seguir comprando</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <p className="mb-3 text-stone-600">Tu carrito está vacío.</p>
        <Link href="/catalogo" className="btn">Ir al catálogo</Link>
      </div>
    );
  }

  const t = cotizacion?.totales;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-3">
        <h1 className="titulo">Carrito</h1>
        {items.map((i) => {
          const p = piezas.find((x) => x.id === i.producto_id);
          return (
            <div key={i.producto_id} className="card flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- en modo demo las fotos son data URLs */}
              {p && <img src={p.fotografias_urls[0]} alt="" className="size-16 rounded object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p?.nombre ?? 'Pieza'}</p>
                <p className="text-sm text-stone-600">{p && `${formatoMXN(p.precio_unitario)} · ${p.nombre_productor}`}</p>
              </div>
              <div className="flex items-center gap-1">
                <button aria-label="Quitar uno" className="rounded border p-1" onClick={() => cambiar(i.producto_id, i.cantidad - 1)}>
                  {i.cantidad === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
                </button>
                <span className="w-6 text-center">{i.cantidad}</span>
                <button aria-label="Agregar uno" className="rounded border p-1 disabled:opacity-40" disabled={!!p && i.cantidad >= p.stock} onClick={() => cambiar(i.producto_id, i.cantidad + 1)}>
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <aside className="card h-fit space-y-3">
        <h2 className="font-semibold">Desglose transparente</h2>
        {cotizacion?.pedidos.map((p) => (
          <div key={p.productor_id} className="rounded-lg bg-maiz p-3 text-sm">
            <p className="mb-1 font-medium">{p.nombre_productor}</p>
            <Fila etiqueta="Subtotal piezas" valor={p.subtotal} />
            <Fila etiqueta="Para el productor (90%)" valor={p.montoProductor} destacado />
            <Fila etiqueta="Comisión RaicesMX (10%)" valor={p.comisionPlataforma} />
            <Fila etiqueta="Envío" valor={p.costoEnvio} />
          </div>
        ))}
        {t && (
          <div className="space-y-1 border-t pt-3">
            <Fila etiqueta="Total para productores" valor={t.montoProductor} destacado />
            <Fila etiqueta="Total comisión RaicesMX" valor={t.comisionPlataforma} />
            <Fila etiqueta="Total envío" valor={t.costoEnvio} />
            <div className="flex justify-between pt-1 text-lg font-bold">
              <span>Total a pagar</span>
              <span>{formatoMXN(t.total)}</span>
            </div>
          </div>
        )}
        <label className="block">
          <span className="label">Dirección de entrega</span>
          <textarea rows={2} value={direccion} onChange={(e) => setDireccion(e.target.value)} className="input" placeholder="Calle, número, colonia, CP, ciudad" />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="btn w-full" disabled={!t || pagando} onClick={pagar}>
          {pagando ? 'Procesando…' : `Pagar ${t ? formatoMXN(t.total) : ''} (prueba)`}
        </button>
        <p className="text-xs text-stone-500">Pago simulado con tarjeta de prueba. No se realiza ningún cargo.</p>
      </aside>
    </div>
  );
}

function Fila({ etiqueta, valor, destacado }: { etiqueta: string; valor: number; destacado?: boolean }) {
  return (
    <div className={`flex justify-between ${destacado ? 'font-semibold text-milpa' : ''}`}>
      <span>{etiqueta}</span>
      <span>{formatoMXN(valor)}</span>
    </div>
  );
}
