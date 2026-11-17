import { Suspense } from 'react';
import AvisoAcceso from '@/components/AvisoAcceso';
import Badge from '@/components/Badge';
import Cargando from '@/components/Cargando';
import GeneradorReportes from '@/components/GeneradorReportes';
import { formatoMXN } from '@/modules/comisiones/calculo';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';
import type { Reporte } from '@/types';

const ETIQUETAS_TIPO: Record<Reporte['tipo'], string> = {
  ventas: 'Ventas',
  productores: 'Productores',
  comisiones: 'Comisiones',
  auditoria: 'Auditoría',
  inventario: 'Inventario',
};

function estatusReporte(estado: Reporte['estado']) {
  if (estado === 'generado') return { texto: 'Generado', tono: 'secundaria' as const };
  if (estado === 'pendiente') return { texto: 'Pendiente', tono: 'terciaria' as const };
  return { texto: 'Error', tono: 'terciaria' as const };
}

export default function ReportesAdmin() {
  return (
    <Suspense fallback={<Cargando etiqueta="Cargando indicadores…" />}>
      <ContenidoReportes />
    </Suspense>
  );
}

async function ContenidoReportes() {
  const perfil = await perfilSesion();
  if (!perfil || perfil.rol !== 'admin') {
    return (
      <AvisoAcceso
        titulo="Acceso de administrador"
        mensaje="Esta sección es exclusiva para administradores."
      />
    );
  }

  const [reportes, indicadores] = await Promise.all([
    repo().reportes(),
    repo().indicadores(),
  ]);

  const kpis = [
    { etiqueta: 'Productores', valor: String(indicadores.productores) },
    { etiqueta: 'Piezas', valor: String(indicadores.piezas) },
    { etiqueta: 'Pedidos', valor: String(indicadores.pedidos) },
    { etiqueta: 'Ventas totales', valor: formatoMXN(indicadores.ventasTotales) },
    { etiqueta: 'Comisiones', valor: formatoMXN(indicadores.comisiones) },
    { etiqueta: 'Calificación promedio', valor: indicadores.calificacionPromedio.toFixed(1) },
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow-accent">Indicadores del piloto</p>
        <h1 className="titulo mt-4">Reportes e indicadores</h1>
        <p className="plomo mt-4 max-w-2xl">
          Indicadores generales del piloto e historial de reportes generados.
        </p>
      </header>

      <section aria-label="Indicadores clave" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-12 sm:gap-y-8">
        {kpis.map((k) => (
          <dl key={k.etiqueta} className="regla pt-8">
            <dd className="font-display text-4xl font-semibold leading-none text-terciaria sm:text-5xl">{k.valor}</dd>
            <dt className="eyebrow mt-4">{k.etiqueta}</dt>
          </dl>
        ))}
      </section>

      {/* GeneradorReportes es un componente compartido: no se modifica. El envoltorio
          aplica el acento coral editorial a su botón de acción, equivalente a .btn-accent. */}
      <div className="[&_button[type='submit']]:bg-terciaria [&_button[type='submit']]:hover:bg-terciaria-suave">
        <GeneradorReportes />
      </div>

      <section aria-label="Historial de reportes">
        <p className="eyebrow mb-2">Historial de reportes</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-secundaria/30">
                <th scope="col" className="eyebrow py-4 pr-4">Tipo</th>
                <th scope="col" className="eyebrow px-4 py-4">Formato</th>
                <th scope="col" className="eyebrow px-4 py-4">Estatus</th>
                <th scope="col" className="eyebrow px-4 py-4">Fecha</th>
                <th scope="col" className="eyebrow py-4 pl-4">Archivo</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((r) => {
                const e = estatusReporte(r.estado);
                return (
                  <tr key={r.id} className="border-b border-secundaria/15">
                    <td className="py-5 pr-4 font-medium text-secundaria">{ETIQUETAS_TIPO[r.tipo]}</td>
                    <td className="px-4 py-5 uppercase">{r.formato}</td>
                    <td className="px-4 py-5"><Badge texto={e.texto} tono={e.tono} /></td>
                    <td className="px-4 py-5 text-tinta-clara">
                      {new Date(r.created_at).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-5 pl-4">
                      {r.url_archivo ? (
                        <a href={r.url_archivo} target="_blank" rel="noopener noreferrer" className="enlace text-sm">
                          Descargar
                        </a>
                      ) : (
                        <span className="text-tinta-clara">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {reportes.length === 0 && (
            <p className="regla py-8 plomo">Aún no se han generado reportes.</p>
          )}
        </div>
      </section>
    </div>
  );
}
