import { connection } from 'next/server';
import { ErrorNegocio, manejar } from '@/lib/http';
import { perfilSesion } from '@/lib/supabase/sesion';

// GET /api/v1/perfil — perfil del usuario autenticado (para el encabezado)
export async function GET() {
  await connection();
  return manejar(async () => {
    const perfil = await perfilSesion();
    if (!perfil) throw new ErrorNegocio(401, 'Sin sesión');
    return { perfil };
  });
}
