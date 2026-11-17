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
      <div className="mx-auto max-w-lg py-14 text-center">
        <p className="plomo">Todavía no hay piezas disponibles para armar un lote.</p>
        <Link href="/catalogo" className="btn-sec mt-6">Explorar el catálogo</Link>
      </div>
    );
  }

  if (resultado) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-secundaria" strokeWidth={1.25} />
        <p className="eyebrow-accent mt-6">Pedido confirmado</p>
        <h2 className="subtitulo mt-3">Pedido y contrato generados</h2>
        <div className="regla-accent mt-6" />

        <div className="mt-2 text-left">
          <Fila etiqueta="Folio del pedido" valor={resultado.pedido.folio_pedido} />
          <Fila etiqueta="Folio del contrato" valor={resultado.contrato.folio_contrato} />
          <Fila
            etiqueta="Total del lote"
            valor={formatoMXN(resultado.cotizacion?.total ?? resultado.pedido.total)}
          />
        </div>

        <div className="border-l-2 border-terciaria py-5 pl-5 text-left">
          <p className="eyebrow-accent">Anticipo 30% al confirmar</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-terciaria tabular-nums sm:text-4xl">
            {formatoMXN(resultado.contrato.monto_anticipo_30)}
          </p>
          <p className="mt-2 text-sm text-tinta-clara">
            Saldo del 70% a la entrega: {formatoMXN(resultado.contrato.monto_saldo_70)}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/comprador-b2b/contratos" className="btn">Ver mis contratos</Link>
          <button type="button" className="btn-sec" onClick={() => setResultado(null)}>
            Cotizar otro lote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <form onSubmit={confirmar} className="space-y-4" noValidate>
        <p className="eyebrow">Datos del lote</p>
        <h2 className="subtitulo">Define tu pedido</h2>
        <div className="regla-accent" />

        <label className="block pt-4">
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
          <p className="-mt-2 text-xs text-tinta-clara">
            {pieza.comunidad}, {pieza.estado} · {pieza.tecnica}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
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
            <span className="mt-1 block text-xs text-tinta-clara">
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

        <label className="block pt-2">
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

        <label className="block pt-2">
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
          <p className="border-l-2 border-terciaria bg-terciaria/10 px-4 py-3 text-sm text-terciaria" role="alert">
            {error}
          </p>
        )}

        <div className="pt-4">
          <button
            type="submit"
            className="btn-accent w-full"
            disabled={enviando || !cotizacion || !direccion.trim()}
          >
            {enviando ? 'Generando contrato…' : 'Confirmar pedido'}
          </button>
          <p className="mt-4 text-xs text-tinta-clara">
            Al confirmar se crean el pedido, el contrato y dos cargos programados: el anticipo del 30%
            y el saldo del 70%.
          </p>
        </div>
      </form>

      <aside className="h-fit lg:sticky lg:top-10">
        <p className="eyebrow">Cotización en vivo</p>
        <h2 className="subtitulo mt-3">Desglose</h2>
        <div className="regla-accent mt-4" />
        <p className="mt-3 text-sm text-tinta-clara">
          El descuento se aplica automáticamente por volumen.
        </p>

        {cotizacion ? (
          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-3 border-b border-secundaria/20 py-3 text-sm">
              <span className="text-tinta-clara">Descuento por volumen</span>
              <span className="font-semibold text-secundaria">{cotizacion.porcentajeDescuento}%</span>
            </div>

            <div className="pt-2">
              <Fila
                etiqueta={`Precio base (${cantidad} × ${formatoMXN(pieza?.precio_unitario ?? 0)})`}
                valor={formatoMXN(cotizacion.precioBase)}
              />
              <Fila etiqueta="Ahorro" valor={formatoMXN(-cotizacion.montoDescuento)} />
            </div>

            <div className="border-b border-secundaria/20 py-5">
              <p className="eyebrow">Total del lote</p>
              <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-secundaria tabular-nums">
                {formatoMXN(cotizacion.total)}
              </p>
            </div>

            <div className="border-l-2 border-terciaria py-5 pl-5">
              <p className="eyebrow-accent">Anticipo 30% al confirmar</p>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-terciaria tabular-nums">
                {formatoMXN(cotizacion.anticipo30)}
              </p>
            </div>

            <div className="py-2">
              <Fila etiqueta="Saldo 70% a la entrega" valor={formatoMXN(cotizacion.saldo70)} />
            </div>

            <div className="border-t border-secundaria/20 pt-4">
              <Fila etiqueta="Comisión RaicesMX (5%)" valor={formatoMXN(cotizacion.comisionPlataforma)} />
              <Fila etiqueta="Para el productor" valor={formatoMXN(cotizacion.montoProductor)} />
            </div>
          </div>
        ) : (
          <p className="mt-4 border-l-2 border-terciaria py-2 pl-4 text-sm text-tinta-clara">
            Elige una pieza y una cantidad de {LOTE_MIN} a {LOTE_MAX} piezas para ver la cotización.
          </p>
        )}
      </aside>
    </div>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-secundaria/20 py-2.5 text-sm">
      <span className="text-tinta-clara">{etiqueta}</span>
      <span className="font-medium text-secundaria tabular-nums">{valor}</span>
    </div>
  );
}
