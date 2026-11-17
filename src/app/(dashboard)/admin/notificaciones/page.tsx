import { Suspense } from 'react';
import AvisoAcceso from '@/components/AvisoAcceso';
import Cargando from '@/components/Cargando';
import ListaNotificaciones from '@/components/ListaNotificaciones';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';

export default function NotificacionesAdmin() {
  return (
    <Suspense fallback={<Cargando etiqueta="Cargando notificaciones…" />}>
      <ContenidoNotificaciones />
    </Suspense>
  );
}

async function ContenidoNotificaciones() {
  const perfil = await perfilSesion();
  if (!perfil || perfil.rol !== 'admin') {
    return (
      <AvisoAcceso
        titulo="Acceso de administrador"
        mensaje="Esta sección es exclusiva para administradores."
      />
    );
  }

  const notificaciones = await repo().notificacionesPorUsuario(perfil.id);
  const pendientes = notificaciones.filter(
    (n) => n.estado !== 'leida' && n.leido_en === null
  ).length;

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow-accent">Avisos del sistema</p>
        <h1 className="titulo mt-4">Notificaciones</h1>
        <p className="plomo mt-4 max-w-2xl">Avisos del sistema para tu cuenta de administrador.</p>
      </header>

      <section aria-label="Resumen de notificaciones" className="grid gap-8 sm:grid-cols-2 sm:gap-12">
        <dl className="regla pt-8">
          <dd className="font-display text-4xl font-semibold leading-none text-terciaria sm:text-5xl">
            {notificaciones.length}
          </dd>
          <dt className="eyebrow mt-4">Notificaciones</dt>
        </dl>
        <dl className="regla pt-8">
          <dd className="font-display text-4xl font-semibold leading-none text-terciaria sm:text-5xl">
            {pendientes}
          </dd>
          <dt className="eyebrow mt-4">Sin leer</dt>
        </dl>
      </section>

      <ListaNotificaciones notificaciones={notificaciones} />
    </div>
  );
}
