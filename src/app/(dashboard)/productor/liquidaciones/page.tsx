export const instant = false;

import Link from 'next/link';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';
import { formatoMXN } from '@/modules/comisiones/calculo';
import type { Liquidacion } from '@/types';

export const metadata = { title: 'Liquidaciones' };

function Aviso({ titulo, mensaje, alerta }: { titulo: string; mensaje: string; alerta?: boolean }) {
  return (
    <div className="card">
      <h1 className="titulo mb-4">{titulo}</h1>
      <p className={alerta ? 'text-terciaria' : 'text-stone-600'}>{mensaje}</p>
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
        mensaje={`Esta sección es exclusiva para productores. Tu rol actual es ${perfil.rol}.`}
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
        alerta
      />
    );
  }

  const totalNeto = liquidaciones.reduce((suma, l) => suma + l.monto_neto_productor, 0);
  const totalPendiente = liquidaciones.reduce(
    (suma, l) => suma + (l.liquidado ? 0 : l.monto_neto_productor),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="titulo">Liquidaciones</h1>
        <p className="mt-1 text-stone-600">Detalle de comisiones, retenciones y pagos de tus ventas.</p>
      </div>

      {liquidaciones.length === 0 ? (
        <div className="card text-center">
          <p className="text-stone-600">
            Aún no tienes liquidaciones. Se generan automáticamente cuando vendes una de tus piezas.
          </p>
          <Link href="/productor/publicar" className="btn mt-4">
            Publicar una pieza
          </Link>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="card">
              <p className="label">Total neto acumulado</p>
              <p className="text-2xl font-bold text-secundaria">{formatoMXN(totalNeto)}</p>
            </div>
            <div className="card">
              <p className="label">Total pendiente de pago</p>
              <p className="text-2xl font-bold text-terciaria">{formatoMXN(totalPendiente)}</p>
            </div>
          </section>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th scope="col" className="py-2 text-left font-semibold text-stone-700">Pedido</th>
                  <th scope="col" className="py-2 text-right font-semibold text-stone-700">Monto bruto</th>
                  <th scope="col" className="py-2 text-right font-semibold text-stone-700">Comisión</th>
                  <th scope="col" className="py-2 text-right font-semibold text-stone-700">Retenciones ISR/IVA</th>
                  <th scope="col" className="py-2 text-right font-semibold text-stone-700">Neto al productor</th>
                  <th scope="col" className="py-2 text-left font-semibold text-stone-700">Fecha programada</th>
                  <th scope="col" className="py-2 text-left font-semibold text-stone-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {liquidaciones.map((l) => (
                  <tr key={l.id} className="border-b border-stone-200 last:border-0">
                    <td className="py-2 text-left font-mono text-xs text-secundaria">
                      {l.pedido_id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-2 text-right">{formatoMXN(l.monto_bruto)}</td>
                    <td className="py-2 text-right">
                      {l.porcentaje_comision}%
                      <span className="block text-xs text-stone-500">
                        {formatoMXN(l.monto_comision_plataforma)}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      {formatoMXN(l.retencion_isr)}
                      <span className="block text-xs text-stone-500">IVA {formatoMXN(l.retencion_iva)}</span>
                    </td>
                    <td className="py-2 text-right font-semibold text-secundaria">
                      {formatoMXN(l.monto_neto_productor)}
                    </td>
                    <td className="py-2 text-left text-stone-600">{formatearFecha(l.fecha_programada)}</td>
                    <td className="py-2 text-left">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          l.liquidado ? 'bg-green-100 text-secundaria' : 'bg-terciaria/10 text-terciaria'
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
        </>
      )}
    </div>
  );
}

