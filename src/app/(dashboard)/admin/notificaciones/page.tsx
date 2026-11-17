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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="titulo">Notificaciones</h1>
        <p className="mt-1 text-stone-600">
          Avisos del sistema para tu cuenta de administrador.
        </p>
      </header>

      <ListaNotificaciones notificaciones={notificaciones} />
    </div>
  );
}
