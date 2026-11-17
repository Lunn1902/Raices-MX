import { Suspense } from 'react';
import AvisoAcceso from '@/components/AvisoAcceso';
import Cargando from '@/components/Cargando';
import ModeradorCalificaciones from '@/components/ModeradorCalificaciones';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';

export default function CalificacionesAdmin() {
  return (
    <Suspense fallback={<Cargando etiqueta="Cargando calificaciones…" />}>
      <ContenidoCalificaciones />
    </Suspense>
  );
}

async function ContenidoCalificaciones() {
  const perfil = await perfilSesion();
  if (!perfil || perfil.rol !== 'admin') {
    return (
      <AvisoAcceso
        titulo="Acceso de administrador"
        mensaje="Esta sección es exclusiva para administradores."
      />
    );
  }

  const productores = await repo().listarProductores();
  const grupos = await Promise.all(
    productores.map(async (productor) => {
      const calificaciones = await repo().calificacionesPorProductor(productor.id);
      const promedio = calificaciones.length
        ? calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) / calificaciones.length
        : 0;
      const recientes = [...calificaciones]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 5);
      return { productor, calificaciones, promedio, recientes };
    })
  );

  const conCalificaciones = grupos.filter((g) => g.calificaciones.length > 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="titulo">Calificaciones</h1>
        <p className="mt-1 text-stone-600">
          Reputación de los productores y moderación de comentarios recientes.
        </p>
      </header>

      {conCalificaciones.length === 0 ? (
        <div className="card">
          <p className="text-stone-600">Aún no hay calificaciones registradas.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {conCalificaciones.map(({ productor, calificaciones, promedio, recientes }) => (
            <section key={productor.id} className="card" aria-label={`Calificaciones de ${productor.nombre_completo}`}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-secundaria">{productor.nombre_completo}</h2>
                  <p className="text-sm text-stone-600">{productor.nombre_taller} · {productor.comunidad}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-secundaria">{promedio.toFixed(1)}</p>
                  <p className="text-xs text-stone-500">
                    {calificaciones.length} calificación{calificaciones.length === 1 ? '' : 'es'}
                  </p>
                </div>
              </div>

              <h3 className="mb-2 text-sm font-medium text-stone-700">Comentarios recientes · Moderación</h3>
              <ModeradorCalificaciones calificaciones={recientes} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
