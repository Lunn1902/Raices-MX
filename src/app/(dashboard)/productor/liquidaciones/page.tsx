export const instant = false;

import Link from 'next/link';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';
import { formatoMXN } from '@/modules/comisiones/calculo';
import type { Liquidacion } from '@/types';

export const metadata = { title: 'Liquidaciones' };

function Aviso({ titulo, mensaje }: { titulo: string; mensaje: string }) {
  return (
    <div className="regla py-10">
      <p className="eyebrow-accent">Liquidaciones</p>
      <h1 className="titulo mt-3">{titulo}</h1>
      <p className="plomo mt-4 max-w-xl">{mensaje}</p>
    </div>
  );
}

function formatearFecha(valor: string): string {
  const fecha = new Date(valor.length === 10 ? `${valor}T00:00:00Z` : valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default async function Liquidaciones() {
  const perfil = await perfilSesion();

  if (!perfil) {
    return <Aviso titulo="Liquidaciones" mensaje="Inicia sesión para ver tus liquidaciones." />;
  }

  if (perfil.rol !== 'productor') {
    return (
      <Aviso
        titulo="Liquidaciones"
        mensaje="Esta sección es exclusiva para productores. Tu cuenta no tiene acceso a este espacio."
      />
    );
  }

  let liquidaciones: Liquidacion[];
  try {
    liquidaciones = await repo().liquidacionesPorProductor(perfil.id);
  } catch {
    return (
      <Aviso
        titulo="Liquidaciones"
        mensaje="No pudimos cargar tus liquidaciones. Intenta recargar la página más tarde."
      />
    );
  }

  const totalNeto = liquidaciones.reduce((suma, l) => suma + l.monto_neto_productor, 0);
  const totalPendiente = liquidaciones.reduce(
    (suma, l) => suma + (l.liquidado ? 0 : l.monto_neto_productor),
    0
  );

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow-accent">Tus ingresos</p>
        <h1 className="titulo mt-4">Liquidaciones</h1>
        <p className="plomo mt-4 max-w-2xl">Detalle de comisiones, retenciones y pagos de tus ventas.</p>
      </header>

      {liquidaciones.length === 0 ? (
        <div className="regla py-10">
          <p className="plomo">
            Aún no tienes liquidaciones. Se generan automáticamente cuando vendes una de tus piezas.
          </p>
          <Link href="/productor/publicar" className="btn-accent mt-6">
            Publicar una pieza
          </Link>
        </div>
      ) : (
        <>
          <section aria-label="Resumen de liquidaciones" className="grid gap-8 sm:grid-cols-2 sm:gap-12">
            <dl className="regla pt-8">
              <dd className="font-display text-4xl font-semibold leading-none text-terciaria sm:text-5xl">
                {formatoMXN(totalNeto)}
              </dd>
              <dt className="eyebrow mt-4">Total neto acumulado</dt>
            </dl>
            <dl className="regla pt-8">
              <dd className="font-display text-4xl font-semibold leading-none text-terciaria sm:text-5xl">
                {formatoMXN(totalPendiente)}
              </dd>
              <dt className="eyebrow mt-4">Total pendiente de pago</dt>
            </dl>
          </section>

          <section aria-label="Historial de liquidaciones">
            <p className="eyebrow mb-2">Detalle por pedido</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-secundaria/30">
                    <th scope="col" className="eyebrow py-4 pr-4">Pedido</th>
                    <th scope="col" className="eyebrow px-4 py-4 text-right">Monto bruto</th>
                    <th scope="col" className="eyebrow px-4 py-4 text-right">Comisión</th>
                    <th scope="col" className="eyebrow px-4 py-4 text-right">Retenciones ISR/IVA</th>
                    <th scope="col" className="eyebrow px-4 py-4 text-right">Neto al productor</th>
                    <th scope="col" className="eyebrow px-4 py-4">Fecha programada</th>
                    <th scope="col" className="eyebrow py-4 pl-4">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {liquidaciones.map((l) => (
                    <tr key={l.id} className="border-b border-secundaria/15">
                      <td className="py-5 pr-4 font-mono text-xs text-secundaria">
                        {l.pedido_id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-5 text-right tabular-nums">{formatoMXN(l.monto_bruto)}</td>
                      <td className="px-4 py-5 text-right tabular-nums">
                        {l.porcentaje_comision}%
                        <span className="mt-1 block text-xs text-tinta-clara">
                          {formatoMXN(l.monto_comision_plataforma)}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-right tabular-nums">
                        {formatoMXN(l.retencion_isr)}
                        <span className="mt-1 block text-xs text-tinta-clara">IVA {formatoMXN(l.retencion_iva)}</span>
                      </td>
                      <td className="px-4 py-5 text-right font-semibold text-secundaria tabular-nums">
                        {formatoMXN(l.monto_neto_productor)}
                      </td>
                      <td className="px-4 py-5 text-tinta-clara">{formatearFecha(l.fecha_programada)}</td>
                      <td className="py-5 pl-4">
                        <span
                          className={`inline-flex items-center border-l-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                            l.liquidado ? 'border-secundaria text-secundaria' : 'border-terciaria text-terciaria'
                          }`}
                        >
                          {l.liquidado ? 'Liquidado' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
