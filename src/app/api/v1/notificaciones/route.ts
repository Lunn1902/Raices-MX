import { connection } from 'next/server';
import { ErrorNegocio, manejar } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';

// GET /api/v1/notificaciones  bandeja de avisos del usuario autenticado
export async function GET() {
  await connection();
  return manejar(async () => {
    const perfil = await perfilSesion();
    if (!perfil) throw new ErrorNegocio(401, 'Inicia sesión para ver tus notificaciones');
    return { notificaciones: await repo().notificacionesPorUsuario(perfil.id) };
  });
}
