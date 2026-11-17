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
    <div className="space-y-6">
      <header>
        <h1 className="titulo">Reportes e indicadores</h1>
        <p className="mt-1 text-stone-600">
          Indicadores generales del piloto e historial de reportes generados.
        </p>
      </header>

      <section aria-label="Indicadores clave" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.etiqueta} className="card">
            <p className="text-sm text-stone-600">{k.etiqueta}</p>
            <p className="mt-1 text-2xl font-semibold text-secundaria">{k.valor}</p>
          </div>
        ))}
      </section>

      <GeneradorReportes />

      <section className="card overflow-x-auto" aria-label="Historial de reportes">
        <h2 className="mb-4 text-lg font-semibold text-secundaria">Historial de reportes</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-600">
              <th scope="col" className="p-4 font-medium">Tipo</th>
              <th scope="col" className="p-4 font-medium">Formato</th>
              <th scope="col" className="p-4 font-medium">Estatus</th>
              <th scope="col" className="p-4 font-medium">Fecha</th>
              <th scope="col" className="p-4 font-medium">Archivo</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((r) => {
              const e = estatusReporte(r.estado);
              return (
                <tr key={r.id} className="border-b border-stone-200 last:border-0">
                  <td className="p-4 font-medium">{ETIQUETAS_TIPO[r.tipo]}</td>
                  <td className="p-4 uppercase">{r.formato}</td>
                  <td className="p-4"><Badge texto={e.texto} tono={e.tono} /></td>
                  <td className="p-4 text-stone-600">
                    {new Date(r.created_at).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                  </td>
                  <td className="p-4">
                    {r.url_archivo ? (
                      <a href={r.url_archivo} target="_blank" rel="noopener noreferrer" className="font-medium text-secundaria underline">
                        Descargar
                      </a>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {reportes.length === 0 && (
          <p className="border-t border-stone-200 p-4 text-stone-600">Aún no se han generado reportes.</p>
        )}
      </section>
    </div>
  );
}
