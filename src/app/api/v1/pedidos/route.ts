import { ErrorNegocio, manejar } from '@/lib/http';
import { perfilSesion } from '@/lib/supabase/sesion';
import { comprar } from '@/modules/pedidos-b2c/servicio';

// POST /api/v1/pedidos  { items, direccion_entrega }  pago de prueba (CU-08 + CU-10)
export async function POST(req: Request) {
  return manejar(async () => {
    const perfil = await perfilSesion();
    if (!perfil) throw new ErrorNegocio(401, 'Inicia sesión para comprar');
    if (perfil.rol !== 'comprador_b2c' && perfil.rol !== 'comprador_b2b') {
      throw new ErrorNegocio(403, 'Solo los compradores pueden realizar pedidos');
    }
    return comprar(await req.json(), perfil.id);
  }, 201);
}
