import { connection } from 'next/server';
import { ErrorNegocio, manejar } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';

// GET /api/v1/liquidaciones  liquidaciones del productor o todas para el admin
export async function GET() {
  await connection();
  return manejar(async () => {
    const perfil = await perfilSesion();
    if (!perfil) throw new ErrorNegocio(401, 'Inicia sesión para ver liquidaciones');
    if (perfil.rol === 'productor') {
      return { liquidaciones: await repo().liquidacionesPorProductor(perfil.id) };
    }
    if (perfil.rol === 'admin') {
      return { liquidaciones: await repo().todasLiquidaciones() };
    }
    throw new ErrorNegocio(403, 'Solo productores y administradores pueden ver liquidaciones');
  });
}
