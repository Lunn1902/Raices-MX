import { ErrorNegocio, manejar } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';

// PATCH /api/v1/notificaciones/:id  marca como leída una notificación propia
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return manejar(async () => {
    const perfil = await perfilSesion();
    if (!perfil) throw new ErrorNegocio(401, 'Inicia sesión para actualizar notificaciones');
    await repo().marcarNotificacionLeida(id, perfil.id);
    return { ok: true };
  });
}
