import { connection } from 'next/server';
import { ErrorNegocio, manejar } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';

// GET /api/v1/admin/indicadores  métricas del panel administrativo
export async function GET() {
  await connection();
  return manejar(async () => {
    const perfil = await perfilSesion();
    if (!perfil) throw new ErrorNegocio(401, 'Inicia sesión para ver indicadores');
    if (perfil.rol !== 'admin') throw new ErrorNegocio(403, 'Solo los administradores pueden ver indicadores');
    return { indicadores: await repo().indicadores() };
  });
}
