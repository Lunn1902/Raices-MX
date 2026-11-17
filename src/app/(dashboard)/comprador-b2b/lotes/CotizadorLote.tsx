'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { enviarJson } from '@/components/Campo';
import {
  LOTE_MAX,
  LOTE_MIN,
  cotizarLoteB2B,
  formatoMXN,
  type CotizacionLote,
} from '@/modules/comisiones/calculo';
import type { ContratoB2B, PedidoResumen, PiezaCatalogo } from '@/types';

type ResultadoLote = {
  pedido: PedidoResumen;
  contrato: ContratoB2B;
  cotizacion: CotizacionLote;
};

export default function CotizadorLote({ piezas }: { piezas: PiezaCatalogo[] }) {
  const [piezaId, setPiezaId] = useState(piezas[0]?.id ?? '');
  const [cantidad, setCantidad] = useState(10);
  const [direccion, setDireccion] = useState('');
  const [plazoDias, setPlazoDias] = useState(15);
  const [condiciones, setCondiciones] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<ResultadoLote | null>(null);

  const pieza = piezas.find((p) => p.id === piezaId) ?? null;

  // Cálculo en vivo con la misma función pura que usa el servidor para cobrar.
  const cotizacion = useMemo<CotizacionLote | null>(() => {
    if (!pieza) return null;
    try {
      return cotizarLoteB2B(cantidad, pieza.precio_unitario);
    } catch {
      return null;
    }
  }, [cantidad, pieza]);

  async function confirmar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pieza || !cotizacion || !direccion.trim()) return;

    setEnviando(true);
    setError('');
    const r = await enviarJson<ResultadoLote>('/api/v1/lotes-b2b', 'POST', {
      productoId: pieza.id,
      productorId: pieza.productor_id,
      cantidad,
      precioUnitario: pieza.precio_unitario,
      direccion: direccion.trim(),
      plazoDias,
      condiciones: condiciones.trim(),
    });
    setEnviando(false);

    if (!r.ok) {
      setError(r.error || 'No se pudo generar el pedido. Intenta de nuevo.');
      return;
    }
    setResultado(r.data);
  }

  if (piezas.length === 0) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <p className="mb-3 text-stone-600">Todavía no hay piezas disponibles para armar un lote.</p>
        <Link href="/catalogo" className="btn-sec">Explorar el catálogo</Link>
      </div>
    );
  }

  if (resultado) {
    return (
      <div className="card mx-auto max-w-lg space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-12 text-secundaria" />
        <h2 className="text-xl font-bold text-secundaria">Pedido y contrato generados</h2>
        <div className="space-y-1 rounded-lg bg-fondo p-4 text-left text-sm">
          <p>
            <span className="text-stone-600">Folio del pedido: </span>
            <span className="font-mono font-semibold">{resultado.pedido.folio_pedido}</span>
          </p>
          <p>
            <span className="text-stone-600">Folio del contrato: </span>
            <span className="font-mono font-semibold">{resultado.contrato.folio_contrato}</span>
          </p>
          <p>
            <span className="text-stone-600">Total del lote: </span>
            <b>{formatoMXN(resultado.cotizacion?.total ?? resultado.pedido.total)}</b>
          </p>
          <p className="font-medium text-terciaria">
            Anticipo 30: {formatoMXN(resultado.contrato.monto_anticipo_30)}
          </p>
          <p>
            <span className="text-stone-600">Saldo 70: </span>
            {formatoMXN(resultado.contrato.monto_saldo_70)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/comprador-b2b/contratos" className="btn">Ver mis contratos</Link>
          <button type="button" className="btn-sec" onClick={() => setResultado(null)}>
            Cotizar otro lote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={confirmar} className="card space-y-4" noValidate>
        <h2 className="font-semibold text-secundaria">Datos del lote</h2>

        <label className="block">
          <span className="label">Pieza</span>
          <select
            className="input"
            value={piezaId}
            onChange={(e) => setPiezaId(e.target.value)}
            required
          >
            {piezas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — {formatoMXN(p.precio_unitario)} · {p.nombre_productor}
              </option>
            ))}
          </select>
        </label>
        {pieza && (
          <p className="-mt-2 text-xs text-stone-500">
            {pieza.comunidad}, {pieza.estado} · {pieza.tecnica}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Cantidad de piezas</span>
            <input
              type="number"
              className="input"
              min={LOTE_MIN}
              max={LOTE_MAX}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              required
            />
            <span className="mt-1 block text-xs text-stone-500">
              De {LOTE_MIN} a {LOTE_MAX} piezas por lote
            </span>
          </label>
          <label className="block">
            <span className="label">Plazo de entrega (días)</span>
            <input
              type="number"
              className="input"
              min={1}
              value={plazoDias}
              onChange={(e) => setPlazoDias(Number(e.target.value))}
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="label">Dirección de entrega</span>
          <textarea
            className="input"
            rows={2}
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Calle, número, colonia, CP, ciudad"
            required
          />
        </label>

        <label className="block">
          <span className="label">Condiciones de calidad (opcional)</span>
          <textarea
            className="input"
            rows={3}
            value={condiciones}
            onChange={(e) => setCondiciones(e.target.value)}
            placeholder="Ej. acabado, empaque, tolerancias o materiales requeridos"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-terciaria/10 px-3 py-2 text-sm text-terciaria" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn w-full"
          disabled={enviando || !cotizacion || !direccion.trim()}
        >
          {enviando ? 'Generando contrato…' : 'Confirmar pedido y generar contrato'}
        </button>
        <p className="text-xs text-stone-500">
          Al confirmar se crean el pedido, el contrato y los dos cargos programados (30% y 70%).
        </p>
      </form>

      <aside className="card h-fit space-y-3 lg:sticky lg:top-4">
        <div>
          <h2 className="font-semibold text-secundaria">Cotización en vivo</h2>
          <p className="mt-1 text-xs text-stone-500">El descuento se aplica automáticamente por volumen.</p>
        </div>

        {cotizacion ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-fondo px-3 py-2 text-sm">
              <span>Descuento por volumen</span>
              <span className="font-semibold text-secundaria">{cotizacion.porcentajeDescuento}%</span>
            </div>

            <div className="space-y-1 text-sm">
              <Fila
                etiqueta={`Precio base (${cantidad} × ${formatoMXN(pieza?.precio_unitario ?? 0)})`}
                valor={cotizacion.precioBase}
              />
              <Fila etiqueta="Ahorro" valor={-cotizacion.montoDescuento} />
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-stone-500">Total del lote</p>
              <p className="text-2xl font-bold text-secundaria">{formatoMXN(cotizacion.total)}</p>
            </div>

            <div className="rounded-lg bg-terciaria/5 px-3 py-2">
              <p className="text-xs font-medium text-terciaria">Anticipo 30% al confirmar</p>
              <p className="text-lg font-bold text-terciaria">{formatoMXN(cotizacion.anticipo30)}</p>
            </div>

            <Fila etiqueta="Saldo 70% a la entrega" valor={cotizacion.saldo70} />

            <div className="space-y-1 border-t pt-3 text-xs text-stone-500">
              <Fila etiqueta="Comisión RaicesMX (5%)" valor={cotizacion.comisionPlataforma} />
              <Fila etiqueta="Para el productor" valor={cotizacion.montoProductor} />
            </div>
          </div>
        ) : (
          <p className="rounded-lg bg-fondo p-3 text-sm text-stone-600">
            Elige una pieza y una cantidad de {LOTE_MIN} a {LOTE_MAX} piezas para ver la cotización.
          </p>
        )}
      </aside>
    </div>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{etiqueta}</span>
      <span className="font-medium tabular-nums">{formatoMXN(valor)}</span>
    </div>
  );
}
