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
    <div className="space-y-10">
      <header>
        <p className="eyebrow-accent">Reputación de talleres</p>
        <h1 className="titulo mt-4">Calificaciones</h1>
        <p className="plomo mt-4 max-w-2xl">
          Reputación de los productores y moderación de comentarios recientes.
        </p>
      </header>

      {conCalificaciones.length === 0 ? (
        <div className="regla py-10">
          <p className="plomo">Aún no hay calificaciones registradas.</p>
        </div>
      ) : (
        <section aria-label="Calificaciones por productor" className="grid gap-x-12 gap-y-8 lg:grid-cols-2">
          {conCalificaciones.map(({ productor, calificaciones, promedio, recientes }) => (
            <article key={productor.id} className="regla py-8" aria-label={`Calificaciones de ${productor.nombre_completo}`}>
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="eyebrow-accent">{productor.estado || 'Productor'}</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-secundaria sm:text-3xl">
                    {productor.nombre_completo}
                  </h2>
                  <p className="plomo mt-2 text-sm">{productor.nombre_taller} · {productor.comunidad}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-4xl font-semibold leading-none text-terciaria sm:text-5xl">
                    {promedio.toFixed(1)}
                  </p>
                  <p className="eyebrow mt-3">
                    {calificaciones.length} {calificaciones.length === 1 ? 'calificación' : 'calificaciones'}
                  </p>
                </div>
              </div>

              <div className="regla mt-8 pt-6">
                <p className="eyebrow mb-4">Comentarios recientes · Moderación</p>
                <ModeradorCalificaciones calificaciones={recientes} />
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
