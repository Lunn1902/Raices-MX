import { z } from 'zod';
import { ErrorNegocio, manejar } from '@/lib/http';
import { repo } from '@/lib/repositorio';
import { perfilSesion } from '@/lib/supabase/sesion';

const esquemaCalificacion = z.object({
  pedidoId: z.string().min(1),
  productorId: z.string().min(1),
  puntuacion: z.number().int().min(1).max(5),
  comentario: z.string().optional(),
});

// POST /api/v1/calificaciones  (RF-14) una calificación de 1 a 5 por pedido
export async function POST(req: Request) {
  return manejar(async () => {
    const perfil = await perfilSesion();
    if (!perfil) throw new ErrorNegocio(401, 'Inicia sesión para calificar');
    if (perfil.rol !== 'comprador_b2c' && perfil.rol !== 'comprador_b2b') {
      throw new ErrorNegocio(403, 'Solo los compradores pueden calificar');
    }

    const datos = esquemaCalificacion.parse(await req.json());
    await repo().crearCalificacion({
      pedidoId: datos.pedidoId,
      compradorId: perfil.id,
      productorId: datos.productorId,
      puntuacion: datos.puntuacion,
      comentario: datos.comentario,
    });
    return { ok: true };
  }, 201);
}
