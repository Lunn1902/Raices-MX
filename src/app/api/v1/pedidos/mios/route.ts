import { connection } from 'next/server';
import { ErrorNegocio, manejar } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';

// GET /api/v1/pedidos/mios  historial del comprador o pedidos recibidos por el productor
export async function GET() {
  await connection();
  return manejar(async () => {
    const perfil = await perfilSesion();
    if (!perfil) throw new ErrorNegocio(401, 'Inicia sesión para ver tus pedidos');
    if (perfil.rol === 'admin') {
      throw new ErrorNegocio(403, 'Los administradores consultan el panel de indicadores');
    }
    if (perfil.rol === 'productor') {
      return { pedidos: await repo().pedidosPorProductor(perfil.id) };
    }
    if (perfil.rol === 'comprador_b2c' || perfil.rol === 'comprador_b2b') {
      return { pedidos: await repo().pedidosPorComprador(perfil.id) };
    }
    throw new ErrorNegocio(403, 'Tu rol no puede consultar pedidos');
  });
}
